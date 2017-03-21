uniform mat4 uModelViewProjectionMatrix;
uniform vec3 uOffset;

attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec3 vNormal;

void main() {
    gl_Position = uModelViewProjectionMatrix * vec4(aPosition + uOffset, 1.0);
    vNormal = aNormal;
}
