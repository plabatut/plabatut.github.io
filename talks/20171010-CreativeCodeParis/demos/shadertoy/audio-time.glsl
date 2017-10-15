// Select music, microphone or SoundCloud clip as input for iChannel0
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy; // uv in [0,1]^2
    float wave = texture(iChannel0, vec2(uv.x, 0.75)).x; // Get value at time x
    vec3 color = vec3(1.0 - smoothstep(-0.1, 0.1, abs(wave - uv.y)));
    fragColor = vec4(color, 1.0);
}
