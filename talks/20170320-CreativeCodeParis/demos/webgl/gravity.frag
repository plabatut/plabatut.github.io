precision highp float;

varying vec3 vNormal;

uniform vec3 uLightVector;
uniform vec3 uAmbient;
uniform vec3 uDiffuse;

void main() {
    vec3 l = normalize(uLightVector);
    vec3 n = vNormal;

    vec3 color = uAmbient + uDiffuse * max(dot(n, l), 0.0);

    gl_FragColor = vec4(color, 1.0);
}
