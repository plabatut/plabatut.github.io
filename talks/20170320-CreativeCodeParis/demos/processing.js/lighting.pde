int WIDTH = 640;
int HEIGHT = 360;
bool applyLighting = true;

void setup() {
    size(WIDTH, HEIGHT, P3D);
    noStroke();
}

void addCamera() {
    float fieldOfView = radians(60.0);
    float aspect = float(WIDTH) / HEIGHT;
    float zNear = 0.01;
    float zFar = 100.0;

    perspective(fieldOfView, aspect, zNear, zFar);

    // eye, center, up
    camera(0.5, -0.5, 1.0,
           0.0, 0.0, 0.0,
           0.0, 1.0, 0.0);
}

void addScene() {
    float S = 0.5;
    float R = S / 2;

    pushMatrix();
    translate(S / 4, S / 4, -S / 4);
    box(S, S, S);
    endShape();
    popMatrix();

    pushMatrix();
    translate(-R / 2, -R / 2, R / 2);
    sphereDetail(128);
    sphere(R);
    popMatrix();
}

void addLight() {
    if (applyLighting) {
        ambientLight(31, 31, 31);
        directionalLight(255, 255, 255, -0.5, 0.75, -2.0);
        lightSpecular(255, 255, 255);
    }
}

void addMaterial() {
    if (applyLighting) {
        fill(52, 101, 164);
        specular(191, 191, 191);
        shininess(100.0);
    } else {
        fill(52, 101, 164);
    }
}

void draw() {
    background(0, 0, 0);

    // Center
    translate(WIDTH / 2.0, HEIGHT / 2.0);

    // Make the screen cover [-1, 1]
    scale(WIDTH / 2.0);

    addCamera();
    addLight();
    addMaterial();
    addScene();
}
