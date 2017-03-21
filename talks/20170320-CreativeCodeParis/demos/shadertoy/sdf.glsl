#define SDF_SPHERE              0
#define SDF_BOX                 1
#define SDF_ROUND_BOX           2

#define SDF_TETRAHEDRON         3
#define SDF_CUBE                4
#define SDF_OCTAHEDRON          5
#define SDF_DODECAHEDRON        6
#define SDF_ICOSAHEDRON         7

#define SDF_TORUS               8
#define SDF_CYLINDER            9
#define SDF_CONE                10
#define SDF_ELLIPSOID           11

#define SDF_CAPPED_CYLINDER     12
#define SDF_CAPPED_CONE         13
#define SDF_CAPSULE             14

#define SDF_TORUS_8_2           15
#define SDF_TORUS_8_8           16

#define SDF_UNION               17
#define SDF_INTERSECTION        18
#define SDF_DIFFERENCE          19
#define SDF_SMOOTH_UNION        20
#define SDF_SMOOTH_INTERSECTION 21
#define SDF_SMOOTH_DIFFERENCE   22

#define SDF_UNION_CAPSULES      23
#define SDF_PIPE_CYLINDERS      24

#define SDF_POLAR_CYLINDERS     25
#define SDF_TRIANGULAR_CYLINDER 26
#define SDF_HEXAGONAL_CYLINDER  27

#define SDF_DISPLACEMENT        28
#define SDF_TWIST               29
#define SDF_BEND                30
#define SDF_BOX_MINUS_CYLINDERS 31

#define SDF_STAR                32

#define SDF_AFFINE              35
#define SDF_REPEAT              36
#define SDF_PLANE               37
#define SDF_SYMMETRY            38

#define SDF_BOX_0               39
#define SDF_BOX_1               40
#define SDF_BOX_2               41
#define SDF_BOX_3               42

#define SDF_LERP                43


//#define SDF SDF_BOX_MINUS_CYLINDERS
#define SDF SDF_BOX_MINUS_CYLINDERS
#define SHOW_DISTANCE_FIELD 0


const float Pi = 3.14159265358;
const int MaxNumSteps = 256;
const float MaxT = 1024.0;
const float Epsilon = 0.001;
const int MaxNumSamples = 16;

mat3 makeRotation(float theta, vec3 u)
{
    mat3 I = mat3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);
    mat3 K = mat3(0.0, u.z, -u.y, -u.z, 0.0, u.x, u.y, -u.x, 0.0);
    return I + sin(theta) * K + (1.0 - cos(theta)) * K * K;
}

float vmin(vec2 v) {
    return min(v.x, v.y);
}

float vmin(vec3 v) {
    return min(v.x, min(v.y, v.z));
}

float vmax(vec2 v) {
    return max(v.x, v.y);
}

float vmax(vec3 v) {
    return max(v.x, max(v.y, v.z));
}

float length8(vec2 v)
{
    float x = v.x;
    float y = v.y;

    float x2 = x * x;
    float y2 = y * y;

    float x4 = x2 * x2;
    float y4 = y2 * y2;

    float x8 = x4 * x4;
    float y8 = y4 * y4;

    return pow(x8 + y8, 0.0625);
}

float length8(vec3 v)
{
    float x = v.x;
    float y = v.y;
    float z = v.z;

    float x2 = x * x;
    float y2 = y * y;
    float z2 = z * z;

    float x4 = x2 * x2;
    float y4 = y2 * y2;
    float z4 = z2 * z2;

    float x8 = x4 * x4;
    float y8 = y4 * y4;
    float z8 = z4 * z4;

    return pow(x8 + y8 + z8, 0.0625);
}


// See: https://en.wikipedia.org/wiki/Platonic_solid#Cartesian_coordinates

const float Phi = 0.5 * (1.0 + sqrt(5.0));

// See: Generalized Distance Functions, Akleman and Chen, 1999
const vec3 gdfN01 = vec3(1.0, 0.0, 0.0);
const vec3 gdfN02 = vec3(0.0, 1.0, 0.0);
const vec3 gdfN03 = vec3(0.0, 0.0, 1.0);

const vec3 gdfN04 = normalize(vec3( 1.0,  1.0,  1.0));
const vec3 gdfN05 = normalize(vec3(-1.0,  1.0,  1.0));
const vec3 gdfN06 = normalize(vec3( 1.0, -1.0,  1.0));
const vec3 gdfN07 = normalize(vec3( 1.0,  1.0, -1.0));

// Phi^2 = Phi + 1
// (1 / Phi, Phi) ~ (1, Phi + 1)
const vec3 gdfN08 = normalize(vec3(       0.0,       1.0, Phi + 1.0));
const vec3 gdfN09 = normalize(vec3(       0.0,      -1.0, Phi + 1.0));
const vec3 gdfN10 = normalize(vec3( Phi + 1.0,       0.0,       1.0));
const vec3 gdfN11 = normalize(vec3(-Phi - 1.0,       0.0,       1.0));
const vec3 gdfN12 = normalize(vec3(       1.0, Phi + 1.0,       0.0));
const vec3 gdfN13 = normalize(vec3(      -1.0, Phi + 1.0,       0.0));

const vec3 gdfN14 = normalize(vec3( 0.0,  Phi, 1.0));
const vec3 gdfN15 = normalize(vec3( 0.0, -Phi, 1.0));
const vec3 gdfN16 = normalize(vec3( 1.0,  0.0, Phi));
const vec3 gdfN17 = normalize(vec3(-1.0,  0.0, Phi));
const vec3 gdfN18 = normalize(vec3( Phi,  1.0, 0.0));
const vec3 gdfN19 = normalize(vec3(-Phi,  1.0, 0.0));

float sdfTetrahedron(vec3 point, float radius)
{
    const vec3 n1 = normalize(vec3( 1.0,  1.0,  1.0));
    const vec3 n2 = normalize(vec3(-1.0, -1.0,  1.0));
    const vec3 n3 = normalize(vec3( 1.0, -1.0, -1.0));
    const vec3 n4 = normalize(vec3(-1.0,  1.0, -1.0));

    radius /= sqrt(3.0);

    float d = dot(n1, point) - radius;
    d = max(d, dot(n2, point) - radius);
    d = max(d, dot(n3, point) - radius);
    d = max(d, dot(n4, point) - radius);

    return d;
}

float sdfCube(vec3 point, float radius)
{
    const vec3 n1 = gdfN01;
    const vec3 n2 = gdfN02;
    const vec3 n3 = gdfN03;

    float d = abs(dot(n1, point));
    d = max(d, abs(dot(n2, point)));
    d = max(d, abs(dot(n3, point)));

    return d - radius;
}

float sdfOctahedron(vec3 point, float radius)
{
    const vec3 n1 = gdfN04;
    const vec3 n2 = gdfN05;
    const vec3 n3 = gdfN06;
    const vec3 n4 = gdfN07;

    float d = abs(dot(n1, point));
    d = max(d, abs(dot(n2, point)));
    d = max(d, abs(dot(n3, point)));
    d = max(d, abs(dot(n4, point)));

    return d - radius;
}

float sdfDodecahedron(vec3 point, float radius)
{
    const vec3 n1 = gdfN14;
    const vec3 n2 = gdfN15;
    const vec3 n3 = gdfN16;
    const vec3 n4 = gdfN17;
    const vec3 n5 = gdfN18;
    const vec3 n6 = gdfN19;

    float d = abs(dot(n1, point));
    d = max(d, abs(dot(n2, point)));
    d = max(d, abs(dot(n3, point)));
    d = max(d, abs(dot(n4, point)));
    d = max(d, abs(dot(n5, point)));
    d = max(d, abs(dot(n6, point)));

    return d - radius;
}

float sdfIcosahedron(vec3 point, float radius)
{
    const vec3 n1 = gdfN04;
    const vec3 n2 = gdfN05;
    const vec3 n3 = gdfN06;
    const vec3 n4 = gdfN07;
    const vec3 n5 = gdfN08;
    const vec3 n6 = gdfN09;
    const vec3 n7 = gdfN10;
    const vec3 n8 = gdfN11;
    const vec3 n9 = gdfN12;
    const vec3 n10 = gdfN13;

    float d = abs(dot(n1, point));
    d = max(d, abs(dot(n2, point)));
    d = max(d, abs(dot(n3, point)));
    d = max(d, abs(dot(n4, point)));
    d = max(d, abs(dot(n5, point)));
    d = max(d, abs(dot(n6, point)));
    d = max(d, abs(dot(n7, point)));
    d = max(d, abs(dot(n8, point)));
    d = max(d, abs(dot(n9, point)));
    d = max(d, abs(dot(n10, point)));

    return d - radius;
}

float sdfTorus(vec3 point, float radius1, float radius2)
{
    vec2 d = vec2(length(point.xy) - radius1, point.z);
    return length(d) - radius2;
}

float sdfTorus82(vec3 point, float radius1, float radius2)
{
    vec2 d = vec2(length(point.xy) - radius1, point.z);
    return length8(d) - radius2;
}

float sdfTorus88(vec3 point, float radius1, float radius2)
{
    vec2 d = vec2(length8(point.xy) - radius1, point.z);
    return length8(d) - radius2;
}

float sdfSphere(vec3 point, float radius)
{
    return length(point) - radius;
}

float sdfBox2(vec3 point, vec3 size)
{
    return vmax(abs(point) - size);
}

float sdfBox(vec3 point, vec3 size)
{
    vec3 d = abs(point) - size;
    return length(max(d, 0.0)) + min(vmax(d), 0.0);
}

float sdfRoundBox(vec3 point, vec3 size, float radius)
{
    return sdfBox(point, size) - radius;
}

float sdfPlane(vec3 point, vec3 normal, float offset)
{
    return dot(normal, point) - offset;
}

float sdfEllipsoid(vec3 point, vec3 size)
{
    return vmin(size) * (length(point / size) - 1.0);
}

float sdfEllipsoid8(vec3 point, vec3 size)
{
    return vmin(size) * (length8(point / size) - 1.0);
}

float sdfCapsule(vec3 point, vec3 point1, vec3 point2, float radius)
{
    vec3 u = point - point1;
    vec3 v = point2 - point1;

    float d = clamp(dot(u, v) / dot(v, v), 0.0, 1.0);

    return length(u - d * v) - radius;
}

float sdfCylinder(vec3 point, float radius)
{
    return length(point.xy) - radius;
}

float sdfCappedCylinder(vec3 point, float radius, float height)
{
    vec2 d = abs(vec2(length(point.xy), point.z)) - vec2(radius, height);
    return min(vmax(d), 0.0) + length(max(d, 0.0));
}

float sdfCone(vec3 point, vec2 u)
{
    float d = length(point.xy);
    return dot(u, vec2(d, point.z));
}

float sdfCappedCone(vec3 point, vec2 u, float size)
{
    float d = length(point.xy);
    return dot(u, vec2(d, point.z));
}

float sdfTriangularCylinder(vec3 point, float radius)
{
    const float s2 = sqrt(2.0);
    const float s3 = sqrt(3.0);

    const vec2 n1 = vec2(0.0, 1.0);
    const vec2 n2 = 0.5 * vec2(-s3, -1.0);
    const vec2 n3 = 0.5 * vec2( s3, -1.0);

    radius /= s3; // FIXME: ?

    float d = dot(n1, point.xy) - radius;
    d = max(d, dot(n2, point.xy) - radius);
    d = max(d, dot(n3, point.xy) - radius);

    return d;
}

float sdfBoxCylinder(vec3 point, vec2 size)
{
    vec2 d = abs(point.xy) - size;
    return length(max(d, 0.0)) + min(vmax(d), 0.0);
}

float sdfHexagonalCylinder(vec3 point, float radius)
{
    const float s3 = sqrt(3.0);

    const vec2 n1 = 0.5 * vec2(1.0, s3);
    const vec2 n2 = 0.5 * vec2(-1.0, s3);
    const vec2 n3 = vec2(-1.0, 0.0);

    float d = abs(dot(n1, point.xy));
    d = max(d, abs(dot(n2, point.xy)));
    d = max(d, abs(dot(n3, point.xy)));

    return d - radius;
}

float sdfSmoothMin(float d1, float d2, float f)
{
    float t = clamp(0.5 - 0.5 * (d2 - d1) / f, 0.0, 1.0);

    return mix(d1, d2, t) - f * t * (1.0 - t);
}

float sdfSmoothMax(float d1, float d2, float f)
{
    return -sdfSmoothMin(-d1, -d2, f);
}

float sdfSmoothDifference(float d1, float d2, float f)
{
    return -sdfSmoothMin(-d1, d2, f);
}

float sdfBackground(vec3 point)
{
    return sdfPlane(point, vec3(0.0, 0.0, 1.0), -1.0);
}

vec3 spTwist(vec3 point, float f)
{
    float c = cos(f * point.z);
    float s = sin(f * point.z);

    mat2 R = mat2( c, s,
                  -s, c);

    return vec3(R * point.xy, point.z);
}

vec3 spBend(vec3 point, float f)
{
    float c = cos(f * point.z);
    float s = sin(f * point.z);

    mat2 R = mat2( c, s,
                  -s, c);

    return vec3(R * point.xz, point.y);
}

float sdfForeground(vec3 point)
{
#if SDF == SDF_SPHERE
    return sdfSphere(point, 1.0);
#elif SDF == SDF_BOX
    return sdfBox(point, vec3(0.5, 0.75, 1.0));
#elif SDF == SDF_ROUND_BOX
    return sdfRoundBox(point, vec3(0.375, 0.5, 0.75), 0.125);
#elif SDF == SDF_TETRAHEDRON
    return sdfTetrahedron(point, 1.0);
#elif SDF == SDF_CUBE
    return sdfCube(point, 1.0);
#elif SDF == SDF_OCTAHEDRON
    return sdfOctahedron(point, 0.5);
#elif SDF == SDF_DODECAHEDRON
    return sdfDodecahedron(point, 0.75);
#elif SDF == SDF_ICOSAHEDRON
    return sdfIcosahedron(point, 0.75);
#elif SDF == SDF_TORUS
    return sdfTorus(point, 1.0, 1.0 / 2.5);
#elif SDF == SDF_CYLINDER
    return sdfCylinder(point, 1.0);
#elif SDF == SDF_CONE
    return sdfCone(point, normalize(vec2(1.0, 1.0)));
#elif SDF == SDF_ELLIPSOID
    return sdfEllipsoid(point, vec3(1.5, 0.75, 1.0));
#elif SDF == SDF_CAPPED_CYLINDER
    return sdfCappedCylinder(point, 0.75, 1.0);
#elif SDF == SDF_CAPPED_CONE
    return sdfCappedCone(point, 1.0, 0.25); // TODO
#elif SDF == SDF_CAPSULE
    return sdfCapsule(point,
                      vec3(-1.0, 0.0, 0.0),
                      vec3( 1.0, 0.0, 0.0),
                      0.5);
#elif SDF == SDF_TORUS_8_2
    return sdfTorus82(point, 1.0, 1.0 / 2.5);
#elif SDF == SDF_TORUS_8_8
    return sdfTorus88(point, 1.0, 1.0 / 2.5);
#elif SDF == SDF_UNION
    float d1 = sdfCappedCylinder(point, 0.75, 1.0);
    float d2 = sdfTorus(point, 0.75, 1.0 / 2.5);

    return min(d1, d2);
#elif SDF == SDF_INTERSECTION
    float d1 = sdfCappedCylinder(point, 0.75, 1.0);
    float d2 = sdfTorus(point, 0.75, 1.0 / 2.5);

    return max(d1, d2);
#elif SDF == SDF_DIFFERENCE
    float d1 = sdfCappedCylinder(point, 0.75, 1.0);
    float d2 = sdfTorus(point, 0.75, 1.0 / 2.5);

    return max(d1, -d2);
#elif SDF == SDF_SMOOTH_UNION
    float d1 = sdfCappedCylinder(point, 0.75, 1.0);
    float d2 = sdfTorus(point, 0.75, 1.0 / 2.5);

    return sdfSmoothMin(d1, d2, 0.5);
#elif SDF == SDF_SMOOTH_INTERSECTION
    float d1 = sdfCappedCylinder(point, 0.75, 1.0);
    float d2 = sdfTorus(point, 0.75, 1.0 / 2.5);

    return sdfSmoothMax(d1, d2, 0.5);
#elif SDF == SDF_SMOOTH_DIFFERENCE
    float d1 = sdfCappedCylinder(point, 0.75, 1.0);
    float d2 = sdfTorus(point, 0.75, 1.0 / 2.5);

    return sdfSmoothDifference(d1, d2, 0.5);
#elif SDF == SDF_UNION_CAPSULES
    float d1 = sdfCapsule(point,
                          vec3(-1.0,  0.0,  0.0),
                          vec3( 1.0,  0.0,  0.0),
                          0.25);
    float d2 = sdfCapsule(point,
                          vec3( 0.0, -1.0,  0.0),
                          vec3( 0.0,  1.0,  0.0),
                          0.25);
    float d3 = sdfCapsule(point,
                          vec3( 0.0,  0.0, -1.0),
                          vec3( 0.0,  0.0,  1.0),
                          0.25);
    return min(d1, min(d2, d3));
#elif SDF == SDF_PIPE_CYLINDERS
    float d1 = sdfCylinder(point, 0.75);
    float d2 = sdfCylinder(point.yzx - vec3(0.75, 0.0, 0.0), 0.75);

    return length(vec2(d1, d2)) - 0.25;
#elif SDF == SDF_POLAR_CYLINDERS
    float theta = atan(point.y, point.x);
    theta = mod(theta + Pi / 6.0, Pi / 3.0) - Pi / 6.0;
    float r = length(point.xy);

    point.xy = r * vec2(cos(theta), sin(theta));

    return sdfCylinder(point.yzx, 0.5);
#elif SDF == SDF_TRIANGULAR_CYLINDER
    return sdfTriangularCylinder(point, 1.0);
#elif SDF == SDF_HEXAGONAL_CYLINDER
    return sdfHexagonalCylinder(point, 1.0);
#elif SDF == SDF_DISPLACEMENT
    float d1 = sdfSphere(point, 1.0);
    float d2 = 0.05 * sin(12.0 * point.x) * sin(12.0 * point.y) * sin(12.0 * point.z);

    return d1 + d2;
#elif SDF == SDF_TWIST
    point = spTwist(point, 1.0);
    return sdfRoundBox(point, vec3(0.375, 0.5, 0.75), 0.125);
#elif SDF == SDF_BEND
    point = spBend(point, 0.25);
    return sdfRoundBox(point, vec3(0.375, 0.5, 0.75), 0.125);
#elif SDF == SDF_BOX_MINUS_CYLINDERS
    point = point.xzy;

    float d1 = sdfRoundBox(point, vec3(2.25, 0.75, 0.5), 0.125);
    float d2 = sdfCylinder(point -vec3(1.5, 0.0, 0.0), 0.5);
    float d3 = sdfBoxCylinder(point, vec2(0.5));
    float d4 = sdfHexagonalCylinder(point + vec3(1.5, 0.0, 0.0), 0.5);

    float d234 = min(d2, min(d3, d4));

    float r = 0.0625;
    vec2 u = max(vec2(r + d1, r - d234), vec2(0.0));
    return min(-r, max(d1, -d234)) + length(u);
#elif SDF == SDF_STAR
    float theta = atan(point.x, point.z); // - iGlobalTime;
    float r = length(point.xz);

    theta = mod(theta + Pi / 5.0, Pi / 2.5) - Pi / 5.0;
    point.zx = r * vec2(cos(theta), sin(theta));
    point.xy = abs(point.xy);

    return sdfPlane(point, normalize(vec3(3.0, 5.0, 1.0)), 0.2);
#elif SDF == SDF_AFFINE
    mat3 Rz = makeRotation(Pi / 6.0, vec3(0.0, 0.0, 1.0));
    mat3 Ry = makeRotation(-Pi / 6.0, vec3(0.0, 1.0, 0.0));
    float s = 1.5;

    point = s * Ry * Rz * point + vec3(1.0, 0.5, 0.25);

    return sdfRoundBox(point, vec3(0.375, 0.5, 0.75), 0.125) / s;
#elif SDF == SDF_REPEAT
    vec2 size = vec2(2.0, 3.0);
    point.xy = mod(point.xy + 0.5 * size, size) - 0.5 * size;
    return sdfRoundBox(point, vec3(0.375, 0.5, 0.75), 0.125);
#elif SDF == SDF_PLANE
    return sdfPlane(point, vec3(0.0, 0.0, 1.0), 0.0);
#elif SDF == SDF_SYMMETRY
    point.xy = abs(point.xy);
    point.xy -= vec2(0.75, 1.0);
    return sdfRoundBox(point, vec3(0.375, 0.5, 0.75), 0.125);
#elif SDF == SDF_LERP
    float d1 = sdfSphere(point, 1.0);
    float d2 = sdfRoundBox(point, vec3(0.375, 0.5, 0.75), 0.125);
    float a = 0.75;
    return mix(d1, d2, a);
#elif SDF == SDF_BOX_0
    return point.z - 1.0;
#elif SDF == SDF_BOX_1
    return abs(point.z) - 1.0;
#elif SDF == SDF_BOX_2
    return vmax(abs(point.yz) - vec2(0.75, 1.0));
#elif SDF == SDF_BOX_3
    return sdfBox(point, vec3(0.5, 0.75, 1.0));
#endif // SDF
}

vec2 sdf(vec3 point)
{
    float d1 = sdfBackground(point);
    float d2 = sdfForeground(point);

    float d = min(d1, d2);

    return vec2(d, d1 <= d2 ? 0.0 : 1.0);
}

vec3 sdfNormal(vec3 point)
{
    const vec3 h = Epsilon * vec3(1.0, 0.0, 0.0);

    return normalize(vec3(sdf(point + h.xyz).x - sdf(point - h.xyz).x,
                          sdf(point + h.zxy).x - sdf(point - h.zxy).x,
                          sdf(point + h.yzx).x - sdf(point - h.yzx).x));
}

vec2 intersect(vec3 origin, vec3 direction)
{
    float t = 0.0;

    for (int i = 0; i < MaxNumSteps; ++i) {
        vec3 point = origin + t * direction;
        vec2 result = sdf(point);
        float d = result.x;

        if (d < Epsilon)
            return vec2(t, result.y);

        t += d;
    }

    return vec2(MaxT, 0.0);
}

void getRay(in vec2 fragCoord, out vec3 origin, out vec3 direction)
{
    vec2 xy = 2.0 * (fragCoord.xy / iResolution.xy) - vec2(1.0);
    xy.y *= iResolution.y / iResolution.x;

    origin = vec3(0.0, 0.0, 4.0);
    direction = normalize(vec3(xy, -1.0));

    float theta = Pi / 24.0 + mod(iGlobalTime / 50.0, 2.0 * Pi);

    mat3 Rz = makeRotation(theta, vec3(0.0, 0.0, 1.0));
    mat3 Rx = makeRotation(Pi / 3.0, vec3(1.0, 0.0, 0.0));
    mat3 R = Rz * Rx;

    origin = R * origin;
    direction = R * direction;
}

const vec3 lightVector = normalize(vec3(0.2, 1.0, -0.6));

float intersectShadow(vec3 origin, vec3 direction,
                      float minT, float maxT, float k)
{
    float t = minT;
    float s = 1.0;
    float d = 0.0;

    if (t >= maxT)
        return s;

    for (int i = 0; i < MaxNumSteps; ++i) {
        vec3 point = origin + t * direction;
        float d = sdf(point).x;

        if (d < Epsilon)
            return 0.0;

        s = min(s, k * d / t);
        t += d;

        if (t >= maxT)
            return s;
    }

    return s;
}

float shadow(vec3 point)
{
#if SDF == SDF_PIPE_CYLINDERS || SDF == SDF_DISPLACEMENT || SDF == SDF_TWIST || SDF == SDF_BEND || SDF == SDF_STAR
    float minT = 0.5;
#else
    float minT = 0.01;
#endif
    return intersectShadow(point, -lightVector, minT, 8.0, 2.0);
}

#if SHOW_DISTANCE_FIELD == 1
float decay(float s, float x)
{
    float y = x / s;

    return exp(-y * y);
}

vec3 sampleTexture(vec3 texcoord)
{
    float d = sdfForeground(texcoord);

    vec3 fgColor1 = vec3(0.125, 0.125, 0.625);
    vec3 fgColor0 = vec3(0.625, 0.625, 0.125);
    float fgAlpha = exp(-0.1875 * floor(d));
    vec3 fgColor = mix(fgColor0, fgColor1, fgAlpha);

    vec3 bgColor = vec3(0.0, 0.0, 0.0);
    float x = mod(d + 0.5, 1.0) - 0.5;
    float sigma = 0.02;
    float alpha = decay(sigma, x);

    return mix(fgColor, bgColor, alpha);
}

vec3 sampleTexture(vec3 texCoord, vec3 texCoordDx, vec3 texCoordDy,
                   vec3 normal)
{
    vec3 DtexCoordDx = texCoordDx - texCoord;
    vec3 DtexCoordDy = texCoordDy - texCoord;

    int sizeX = 1 + int(clamp(16.0 * length(DtexCoordDx), 0.0, float(MaxNumSamples - 1)));
    int sizeY = 1 + int(clamp(16.0 * length(DtexCoordDy), 0.0, float(MaxNumSamples - 1)));

    vec3 texCoord0 = texCoord;
    vec3 color = vec3(0.0);

    for (int i = 0; i < MaxNumSamples; ++i) {
        for (int j = 0; j < MaxNumSamples; ++j) {
            if (i < sizeX && j < sizeY) {
                vec2 xy = vec2(float(i), float(j)) / vec2(float(sizeX), float(sizeY));
                vec3 texCoord = texCoord0 + xy.x * DtexCoordDx + xy.y * DtexCoordDy;
                color += sampleTexture(texCoord);
            }
        }
    }

    return color / float(sizeX * sizeY);
}
#endif

vec3 shade(vec3 point, vec3 normal, vec3 eye, float m)
{
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;

    if (m == 0.0) {
#if SHOW_DISTANCE_FIELD == 0
        float i = floor(point.x);
        float j = floor(point.y);
        float c = mod(i + j, 2.0);

        ambient = c == 0.0 ? vec3(0.1, 0.1, 0.1) : vec3(0.2, 0.2, 0.2);
#endif

#if SHOW_DISTANCE_FIELD == 1
        vec3 texCoord = point;
        vec3 texCoordDx = texCoord + dFdx(texCoord);
        vec3 texCoordDy = texCoord + dFdy(texCoord);

        ambient = sampleTexture(texCoord, texCoordDx, texCoordDy, normal);
#endif

        diffuse = vec3(0.5, 0.5, 0.5);
        specular = vec3(0.1, 0.1, 0.1);
        shininess = 10.0;
    }

    if (m == 1.0) {
#if SHOW_DISTANCE_FIELD == 0
        ambient = vec3(0.05, 0.075, 0.1);
        diffuse = vec3(0.15, 0.3, 0.5);
        specular = vec3(0.4, 0.4, 0.4);
        shininess = 20.0;
#endif

#if SHOW_DISTANCE_FIELD == 1
        float i = floor(2.0 * point.x);
        float j = floor(2.0 * point.y);
        float k = floor(2.0 * point.z);
        float c = mod(i + j + k, 2.0);

        ambient = c == 0.0 ? vec3(0.6, 0.6, 0.6) : vec3(0.2, 0.2, 0.2);
        diffuse = vec3(0.2, 0.2, 0.2);
#endif
    }

    vec3 eyeDirection = normalize(point - eye);
    vec3 eyeReflected = reflect(eyeDirection, normal);

    vec3 color = vec3(0.0);
    color += diffuse * max(dot(normal, -lightVector), 0.0);
    color += specular * pow(max(dot(eyeReflected, -lightVector), 0.0), shininess);
    color *= shadow(point);
    color += ambient;

    return color;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec3 origin, direction;
    getRay(fragCoord, origin, direction);

    fragColor = vec4(vec3(0.0), 1.0);

    vec2 result = intersect(origin, direction);
    float t = result.x;

    if (t >= MaxT)
        return;

    vec3 point = origin + t * direction;
    vec3 normal = sdfNormal(point);
    float m = result.y;

    vec3 color = shade(point, normal, origin, m);

    const vec3 fogColor = vec3(0.05, 0.05, 0.05);
    fragColor.xyz = mix(color, fogColor, 1.0 - exp(-0.001 * t * t));
}
