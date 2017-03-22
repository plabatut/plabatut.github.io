uniform mat4 uModelViewProjectionMatrix;
uniform vec2 uSpherePositions[3];
uniform vec3 uOffset;
uniform vec3 uDiffuse;

attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec3 vNormal;
varying vec3 vDiffuse;
varying vec2 vMisc; // interpolated z, distance to origin

float computeZ(vec2 position) {
    const float Pi = 3.14159;
    const float g = 200.0;

    float z = 0.0;

    for (int i = 0; i < 3; ++i) {
        float d = distance(position, uSpherePositions[i]);
        z += d > g ? 0.0 : tan(((g - d) / g) * 0.5 * Pi) * (-g / 4.0);
    }

    return z / 10.0;
}

void main() {
    float z = uOffset.z;
    float smoothZ = 0.0;
    vec3 diffuse = uDiffuse;

    if (z != 0.0) {
        z = computeZ(uOffset.xy);
        smoothZ = computeZ(aPosition.xy + uOffset.xy);

        float value = (200.0 + 2.0 * z) / 255.0;
        diffuse = vec3(max(value, 0.0));
    }

    vec3 position = aPosition + vec3(uOffset.xy, z);
    gl_Position = uModelViewProjectionMatrix * vec4(position, 1.0);
    vNormal = aNormal;
    vDiffuse = diffuse;

    float d = length(position);
    vMisc = vec2(smoothZ, d);
}
