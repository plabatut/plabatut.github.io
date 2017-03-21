const float Epsilon = 0.001;
const int MaxNumSteps = 512;
const float MaxT = 1024.0;

float sdfSphere(vec3 P, float R) {
    return length(P) - R;
}

float sdf(vec3 P) {
    return sdfSphere(P, 1.0);
}

vec3 sdfNormal(vec3 P) {
    vec3 h = Epsilon * vec3(1.0, 0.0, 0.0);

    return normalize(vec3(sdf(P + h.xyz) - sdf(P - h.xyz),
                          sdf(P + h.zxy) - sdf(P - h.zxy),
                          sdf(P + h.yzx) - sdf(P - h.yzx)));
}

float intersect(vec3 O, vec3 d) {
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

vec3 shade(vec3 n) {
    vec3 ambient = vec3(0.25);
    vec3 diffuse = vec3(0.7);

    vec3 l = normalize(vec3(1.0, 1.0, 2.0));

    return ambient
        + diffuse * max(dot(n, l), 0.0);
}

void makeRay(in vec2 fragCoord, out vec3 O, out vec3 d) {
    vec2 xy = 2.0 * fragCoord.xy / iResolution.xy - 1.0;
    xy.y *= iResolution.y / iResolution.x;

    O = vec3(0.0, 0.0, 10.0);
    d = normalize(vec3(xy, -1.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 O, d;
    makeRay(fragCoord, O, d);

    float t = intersect(O, d);

    vec3 color = vec3(0.0);

    if (t < MaxT) {
        vec3 P = O + t * d;
        vec3 n = sdfNormal(P);
        color = shade(n);
    }

    fragColor = vec4(color, 1.0);
}
