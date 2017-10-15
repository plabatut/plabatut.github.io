const float Pi = 3.14159265358;
const float MaxT = 1024.0;

float sdfSphere(vec3 P, float R) {
    return length(P) - R;
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

vec3 sdfNormal(vec3 P) {
    const float Epsilon = 0.001;

    vec3 h = Epsilon * vec3(1.0, 0.0, 0.0);

    return normalize(vec3(sdf(P + h.xyz) - sdf(P - h.xyz),
                          sdf(P + h.zxy) - sdf(P - h.zxy),
                          sdf(P + h.yzx) - sdf(P - h.yzx)));
}

float intersect(vec3 O, vec3 d) {
    const float Epsilon = 0.001;
    const int MaxNumSteps = 512;

    float t = 0.0;

    for (int i = 0; i < MaxNumSteps; ++i) {
        vec3 P = O + t * d;
        float r = sdf(P);

        if (r < Epsilon)
            return t;

        t += r;
    }

    return MaxT;
}

vec3 shade(vec3 n, vec3 d) {
    vec3 ambient = vec3(0.05);
    vec3 diffuse = vec3(0.20, 0.40, 0.64);
    vec3 specular = vec3(0.75);
    float shininess = 50.0;

    vec3 l = normalize(vec3(4.0, 1.0, 2.0));
    vec3 r = reflect(d, n);

    return ambient
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

    float t = intersect(O, d);

    vec3 color = vec3(0.0);

    if (t < MaxT) {
        vec3 P = O + t * d;
        vec3 n = sdfNormal(P);
        color = shade(n, d);
    }

    fragColor = vec4(color, 1.0);
}
