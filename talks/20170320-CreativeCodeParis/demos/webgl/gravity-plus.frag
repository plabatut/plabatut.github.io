precision highp float;

varying vec3 vNormal;
varying vec3 vDiffuse;
varying vec2 vMisc; // interpolated z, distance to origin

uniform vec3 uLightVector;
uniform vec3 uAmbient;

vec3 fog(vec3 color, float d) {
    vec3 fogColor = vec3(1.0);
    float a = 1.0 - exp(-0.00003 * d * d);
    return mix(color, fogColor, a);
}

void main() {
    vec3 l = normalize(uLightVector);
    vec3 n = vNormal;

    vec3 color = uAmbient + vDiffuse * max(dot(n, l), 0.0);

    float smoothZ = vMisc.x;

    if (smoothZ != 0.0) {
        // Color stairs
        float z = -0.2 * smoothZ;
        vec3 color0 = vec3(0.25);
        vec3 color1 = color;
        float a = exp(-0.3 * floor(z));
        vec3 bgColor = mix(color0, color1, a);

        // Isolines
        vec3 fgColor = vec3(0.25);
        float x = mod(-z + 0.5, 1.0) - 0.5;
        float s = 0.01;
        float y = x / s;
        a = exp(-y * y);

        color = mix(bgColor, fgColor, a);
    }

    color = fog(color, vMisc.y);

    gl_FragColor = vec4(color, 1.0);
}
