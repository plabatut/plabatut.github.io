const float MaxT = 1024.0;
const float Pi = 3.14159265358;
const float Gamma = 2.2;
const float GridSize = 0.5;

struct Ray {
    vec3 O;
    vec3 d;
};

float vmin(vec3 v) {
    return min(v.x, min(v.y, v.z));
}

float sdfSphere(vec3 P, float R) {
    return length(P) - R;
}

float sdfBox(vec3 P, float R, float r) {
    return length(max(abs(P) - vec3(R), 0.0)) - r;
}

float sdfRoundBox(vec3 P, vec3 s, float r) {
    vec3 Q = abs(P) - s;
    return length(max(Q, 0.0)) - r;
}

float sdfCylinder(vec3 P, float R) {
    return length(P.xy) - R;
}

float sdfPlane(vec3 P, vec3 n, float d) {
    return dot(n, P) + d;
}

vec3 spTwist(vec3 P, float f) {
    float c = cos(f * P.z);
    float s = sin(f * P.z);

    mat2 R = mat2(c, -s, s, c);

    return vec3(R * P.xy, P.z);
}

vec2 sdfBase(vec3 P) {
    float d1 = sdfPlane(P, vec3(0.0, 0.0, 1.0), 8.0);
    float d2 = sdfCylinder(P, 20.0);

    return vec2(max(d1, d2), 0.0);
}

vec2 sdfObject(vec3 P) {
    const float Period = 5.0;

    float d1 = sdfSphere(P, 8.0);
    float d2 = sdfBox(P, 7.0, 1.0);
    float fft = texture(iChannel0, vec2(0.75, 0.75)).x;
    float t = abs(mod(0.5 * fft, Period) - 0.5 * Period) / (0.5 * Period);

    return vec2(mix(d1, d2, t), 1.0);
}

// Returns (signed distance, material ID)
vec2 sdf(vec3 P) {
    float fft = texture(iChannel0, vec2(0.75, 0.25)).x;

    P = spTwist(P, fft);

    vec2 result1 = sdfBase(P);
    vec2 result2 = sdfObject(P);


    float d = min(result1.x, result2.x);
    float m = d == result1.x ? result1.y : result2.y;

    return vec2(d, m);
}

vec2 intersectGrid(vec3 O, vec3 d, out vec3 n, float gridSize) {
    const int MaxNumSteps = 192;
    const vec3 Epsilon = vec3(1e-6);

    // Rescale to unit grid size
    vec3 oldO = O;
    vec3 oldD = d;
    
    O /= gridSize;
    d /= gridSize;

    // Initialize traversal
    vec3 I = floor(O); // Current grid cell
    vec3 dI = sign(d);
    vec3 dIdD = dI / (d + Epsilon); // d.? = 0 -> dIdD.? = 0
    
    vec3 T = (I - O) / (d + Epsilon); // d.? = 0 -> T.? >> 1
    
    // Adjust first grid intersections
    T += max(dI, 0.0) * dIdD; // dI.? >= 0 -> T.? += dIdD.?

    // Traverse the grid and update the current segment [oldT,newT] where
    // the ray intersects the grid.
    float oldT = 0.0;
    vec3 oldP = vec3(0.0);
    float oldF = 0.0;

    for (int i = 0; i < MaxNumSteps; ++i) {
        vec3 newP = gridSize * (I + vec3(0.5)); // Sample grid cells at their center
        vec2 result = sdf(newP);
        float newF = result.x;
        
        if (oldF * newF < 0.0) {
            n = normalize(newP - oldP) * dI;
            vec3 midP = mix(oldP, newP, 0.5); // Center of the traversed grid facet
            
            // Solve ray / plane intersection
            float t = -dot(n, oldO - midP) / dot(n, oldD);

            return vec2(t, result.y);
        }

        float newT = vmin(T);

        if (newT == T.x) {
            I.x += dI.x;
            T.x += dIdD.x;
        } else if (newT == T.y) {
            I.y += dI.y;
            T.y += dIdD.y;
        } else if (newT == T.z) {
            I.z += dI.z;
            T.z += dIdD.z;
        }
        
        oldT = newT;
        oldP = newP;
        oldF = newF;
    }

    return vec2(MaxT, 0.0);
}

float ambientOcclusion(vec3 P, vec3 n, float gridSize)
{
    const int NumSamples = 8;
    const float s = 1.0;
    
    float dt = 0.9 * gridSize; // NOTE: Avoid using exactly the grid size
    float t = dt;    
    float ao = 0.0;

    for (int i = 1; i <= NumSamples; ++i) {
        vec3 Q = P + t * n;
        vec3 I = floor(Q / gridSize);
        vec3 R = gridSize * (I + vec3(0.5));
        
        float r = sdf(R).x;
        
        ao += (t - r) / pow(2.0, float(i));
        t += dt;
    }
    
    return 1.0 - clamp(s * ao, 0.0, 1.0);
}

float getEdgeFactor(vec3 P, float gridSize)
{
    const float BorderHalfWidth = 0.15;

    vec3 Q = abs(mod(P / gridSize + 0.5, 1.0) - 0.5);
    vec3 T = vec3(1.0) - smoothstep(vec3(0.0), vec3(BorderHalfWidth), Q);

    return max(T.x * T.y, max(T.y * T.z, T.z * T.x));
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 shade(vec3 O, vec3 P, vec3 n, vec3 l, float m, float gridSize) {
    const vec3 BorderColor = vec3(0.0625);

    vec3 v = normalize(O - P);
    vec3 h = normalize(l + v);
    float ao = ambientOcclusion(P, n, gridSize);
  //float ao = 1.0;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;

    float a = getEdgeFactor(P, gridSize);
    
    if (m == 0.0) {
        ambient = vec3(0.10);
        diffuse = mix(vec3(0.15), BorderColor, a);
        specular = vec3(0.50);
        shininess = 50.0;
    } else if (m == 1.0) {
        ambient = vec3(0.10, 0.05, 0.0);
        diffuse = vec3(0.15, 0.075, 0.0);

        float fft = texture(iChannel0, vec2(0.75, 0.75)).x;
        diffuse = hsv2rgb(vec3(0.2 * fft, 0.5, 0.25));
        diffuse = mix(diffuse, BorderColor, a);
        specular = vec3(0.50, 0.25, 0.0);
        shininess = 20.0;
    }

    return ao * ambient
      + diffuse * max(dot(n, l), 0.0);
    //+ specular * pow(max(dot(n, h), 0.0), shininess);
}

float getRadius(in vec2 fragCoord) {
    vec2 m = (2.0 * fragCoord.xy - iResolution.xy) / iResolution.yy;

    return length(m);
}

vec3 background(in vec2 fragCoord) {
    float r0 = getRadius(vec2(0.0, iResolution.y));
    float r1 = getRadius(vec2(iResolution.x, 0.0));
    float maxR = max(r0, r1);

    float r = getRadius(fragCoord);
    r = (maxR - r) / maxR;
    r *= r;

    float t = 1.0 - exp(-0.025 * r);
    
    return vec3(t);
}

vec3 applyGamma(in vec3 color) {
    return pow(color, vec3(1.0 / Gamma));
}

mat3 makeRotation(float theta, vec3 u) {
    mat3 K = mat3(0.0, u.z, -u.y, -u.z, 0.0, u.x, u.y, -u.x, 0.0);
    mat3 I = mat3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);

    return I + sin(theta) * K + (1.0 - cos(theta)) * K * K;    
}

struct Pose {
    mat3 R;
    vec3 t;
};

// (R t)^-1 = (R^T -R^T t)
Pose inversePose(in Pose pose) {
    Pose result;
    result.R = transpose(pose.R);
    result.t = -result.R * pose.t;
    return result;
}

Ray map(in Pose pose, in Ray ray) {
    Ray result;
    result.O = pose.R * ray.O + pose.t;
    result.d = pose.R * ray.d;
    return result;
}

Pose lookAt(in vec3 eye, in vec3 center, in vec3 up) {
    vec3 f = normalize(center - eye); // forward
    vec3 r = normalize(cross(f, up)); // right
    vec3 u = cross(r, f); // up

    // Map (r, u, -f) to (x, y, z)
    Pose pose;
    pose.R = mat3(r.x, u.x, -f.x,
                  r.y, u.y, -f.y,
                  r.z, u.z, -f.z); // NOTE: GLSL transposed ctor

    pose.t = pose.R * vec3(-eye);

    return pose;
}

// lookAt + perspective
Ray makeRay(in vec2 fragCoord) {
    vec3 Eye = vec3(20.0 * sin(iTime),
                    20.0 * cos(iTime),
                    15.0);
    const vec3 Center = vec3(0.0, 0.0, 0.0);
    const vec3 Up = vec3(0.0, 0.0, 1.0);
    Pose pose = lookAt(Eye, Center, Up);

    const float FovY = 60.0 * Pi / 180.0;
    const float TanHalfFovY = tan(0.5 * FovY);

    // In [-1,-1]x[1,1] (with square aspect ratio)
    vec2 xy = (2.0 * fragCoord.xy - iResolution.xy) / iResolution.yy;
    float z = 1.0 / TanHalfFovY;

    Ray ray;
    ray.O = vec3(0.0);
    ray.d = normalize(vec3(xy, -z));

    Pose invertedPose = inversePose(pose);
    return map(invertedPose, ray);
}

vec3 render(in vec2 fragCoord) {
    Ray ray = makeRay(fragCoord);
    
    vec3 color = vec3(0.0);

    const vec3 LightVector = normalize(vec3(1.0, 1.0, 2.0));

    vec3 O = ray.O;
    vec3 d = ray.d;

    vec3 n;    
    vec2 result = intersectGrid(O, d, n, GridSize);
    float t = result.x;
    
    if (t < MaxT) {
        vec3 P = O + t * d;

        color = shade(O, P, n, LightVector, result.y, GridSize);
    } else {
        color = background(fragCoord);
    }
        
    return applyGamma(color);
}

void mainImage(out vec4 fragColor, vec2 fragCoord) {
    vec3 color = render(fragCoord);

    fragColor = vec4(color, 1.0);
}
