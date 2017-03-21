const float Epsilon = 0.001;
const int MaxNumSteps = 512;
const float MaxT = 1024.0;

float sdfSphere(vec3 P, float R) {
    return length(P) - R;
}

float sdf(vec3 P) {
    return sdfSphere(P, 1.0);
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
        color = vec3(1.0);
    }

    fragColor = vec4(color, 1.0);
}
