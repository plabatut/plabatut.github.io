// Select music, microphone or SoundCloud clip as input for iChannel0
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy; // uv in [0,1]^2
    float fft = texture(iChannel0, vec2(uv.x, 0.25)).x; // Get value at frequency x
    vec3 color = vec3(fft > uv.y ? fft : 0.0);
    fragColor = vec4(color, 1.0);
}
