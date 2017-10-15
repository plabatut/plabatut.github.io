const float Pi = 3.14159265358;
const float MaxT = 1024.0;

float sdfSphere(vec3 P, float R) {
    return length(P) - R;
}

float vmin(vec3 v) {
    return min(v.x, min(v.y, v.z));
}

float vmax(vec3 v) {
    return max(v.x, max(v.y, v.z));
}

float sdfBox(vec3 P, float s) {
    vec3 d = abs(P) - s;

    return length(max(d, 0.0)) + min(vmax(d), 0.0);
}

float sdf(vec3 P) {
    float size = 0.25;
    vec3 offset = 0.5 * vec3(-size, size, size);

    float d1 = sdfSphere(P - offset, size);
    float d2 = sdfBox(P + offset, size);

    return min(d1, d2);
}

float intersectGrid(vec3 O, vec3 d, out vec3 n, float gridSize)
{
    const int MaxNumSteps = 192;
    const vec3 Epsilon = vec3(1e-4);

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
        float d = sdf(newP);
        float newF = d;
        
        if (oldF * newF < 0.0) {
            n = normalize(newP - oldP) * dI;
            vec3 midP = mix(oldP, newP, 0.5); // Center of the traversed grid facet

            // Solve ray / plane intersection
            float t = -dot(n, oldO - midP) / dot(n, oldD);

            return t;
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

    return MaxT;
}

float ambientOcclusion(vec3 P, vec3 n, float gridSize) {
    const int NumSamples = 32;
    const float s = 32.0;
    
    float dt = 0.9 * gridSize; // NOTE: Avoid using exactly the grid size
    float t = dt;    
    float ao = 0.0;

    for (int i = 1; i <= NumSamples; ++i) {
        vec3 Q = P + t * n;
        vec3 I = floor(Q / gridSize);
        vec3 R = gridSize * (I + vec3(0.5));
        
        float r = sdf(R);
        
        ao += (t - r) / pow(2.0, float(i));
        t += dt;
    }
    
    return 1.0 - clamp(s * ao, 0.0, 1.0);
}

vec3 shade(vec3 P, vec3 n, vec3 d, float gridSize) {
    const vec3 BorderColor = vec3(0.0625);
    const float BorderHalfWidth = 0.15;

    float ao = ambientOcclusion(P, n, gridSize);

    vec3 ambient = vec3(0.20);
    vec3 diffuse = vec3(0.40);
    vec3 specular = vec3(0.75);
    float shininess = 50.0;

    vec3 l = normalize(vec3(4.0, 1.0, 2.0));
    vec3 r = reflect(d, n);

    return ao * ambient
        + diffuse * max(dot(n, l), 0.0)
        + specular * pow(max(dot(r, l), 0.0), shininess);
}

mat3 makeRotation(float theta, vec3 u) {
    mat3 I = mat3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);
    mat3 K = mat3(0.0, u.z, -u.y, -u.z, 0.0, u.x, u.y, -u.x, 0.0);
    return I + sin(theta) * K + (1.0 - cos(theta)) * K * K;
}

void makeRay(in vec2 fragCoord, out vec3 O, out vec3 d) {
    vec2 xy = 2.0 * fragCoord.xy / iResolution.xy - 1.0;
    xy.y *= iResolution.y / iResolution.x;

    mat3 Ry = makeRotation(Pi / 6.0 + 0.1 * iGlobalTime, vec3(0.0, 1.0, 0.0));
    mat3 Rx = makeRotation(-Pi / 6.0, vec3(1.0, 0.0, 0.0));
    mat3 R = Ry * Rx;

    O = R * vec3(0.0, 0.0, 1.5);
    d = R * normalize(vec3(xy, -1.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 O, d;
    makeRay(fragCoord, O, d);

    const float GridSize = 0.02;

    vec3 n;
    float t = intersectGrid(O, d, n, GridSize);

    vec3 color = vec3(0.0);

    if (t < MaxT) {
        vec3 P = O + t * d;

        color = shade(P, n, d, GridSize);
    }

    fragColor = vec4(color, 1.0);
}
