'use strict';

function Matrix4x4() {
  this.m00 = 1;
  this.m01 = 0;
  this.m02 = 0;
  this.m03 = 0;

  this.m10 = 0;
  this.m11 = 1;
  this.m12 = 0;
  this.m13 = 0;

  this.m20 = 0;
  this.m21 = 0;
  this.m22 = 1;
  this.m23 = 0;

  this.m30 = 0;
  this.m31 = 0;
  this.m32 = 0;
  this.m33 = 1;
};

Matrix4x4.prototype = (function() {
  var a;
  var b;

  a = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
  b = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];

  function mul(b00, b01, b02, b03,
               b10, b11, b12, b13,
               b20, b21, b22, b23,
               b30, b31, b32, b33) {
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;
    var a30, a31, a32, a33;

    a00 = this.m00;
    a01 = this.m01;
    a02 = this.m02;
    a03 = this.m03;

    a10 = this.m10;
    a11 = this.m11;
    a12 = this.m12;
    a13 = this.m13;

    a20 = this.m20;
    a21 = this.m21;
    a22 = this.m22;
    a23 = this.m23;

    a30 = this.m30;
    a31 = this.m31;
    a32 = this.m32;
    a33 = this.m33;

    this.m00 = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    this.m01 = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    this.m02 = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    this.m03 = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

    this.m10 = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    this.m11 = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    this.m12 = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    this.m13 = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

    this.m20 = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    this.m21 = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    this.m22 = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    this.m23 = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

    this.m30 = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
    this.m31 = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
    this.m32 = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
    this.m33 = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

    return this;
  }

  return {
    set: function(m00, m01, m02, m03,
                  m10, m11, m12, m13,
                  m20, m21, m22, m23,
                  m30, m31, m32, m33) {
      this.m00 = m00;
      this.m01 = m01;
      this.m02 = m02;
      this.m03 = m03;

      this.m10 = m10;
      this.m11 = m11;
      this.m12 = m12;
      this.m13 = m13;

      this.m20 = m20;
      this.m21 = m21;
      this.m22 = m22;
      this.m23 = m23;

      this.m30 = m30;
      this.m31 = m31;
      this.m32 = m32;
      this.m33 = m33;

      return this;
    },

    identity: function() {
      return this.set(1, 0, 0, 0,
                      0, 1, 0, 0,
                      0, 0, 1, 0,
                      0, 0, 0, 1);
    },

    perspective: function(fovy, aspect, near, far) {
      var bottom, top, left, right;

      bottom = -near * Math.tan(0.5 * fovy * Math.PI / 180.0);
      top = -bottom;
      left = aspect * bottom;
      right = -left;

      return this.frustum(left, right, bottom, top, near, far);
    },

    frustum: function(left, right, bottom, top, near, far) {
      var dx, dy, dz;
      var mx, my, mz;
      var n, nf;

      dx = right - left;
      dy = top - bottom;
      dz = far - near;

      mx = (left + right) / 2;
      my = (bottom + top) / 2;
      mz = (near + far) / 2;

      n = near;
      nf = near * far;

      return mul.call(this, 2 * n / dx,          0,  2 * mx / dx,            0,
                                     0, 2 * n / dy,  2 * my / dy,            0,
                                     0,          0, -2 * mz / dz, -2 * nf / dz,
                                     0,          0,           -1,            0);
    },

    rotate: function(theta, x, y, z) {
      var c, s, d;
      var dxx, dxy, dyy, dyz, dzx, dzz;
      var sx, sy, sz;

      c = Math.cos(theta);
      s = Math.sin(theta);
      d = 1 - c;

      dxx = d * x * x;
      dxy = d * x * y;
      dyy = d * y * y;
      dyz = d * y * z;
      dzx = d * z * x;
      dzz = d * z * z;

      sx = s * x;
      sy = s * y;
      sz = s * z;

      return mul.call(this, dxx + c , dxy - sz, dzx + sy, 0,
                            dxy + sz, dyy + c , dyz - sx, 0,
                            dzx - sy, dyz + sx, dzz + c , 0,
                                   0,        0,        0, 1);
    },

    translate: function(x,y,z) {
      return mul.call(this, 1, 0, 0, x,
                            0, 1, 0, y,
                            0, 0, 1, z,
                            0, 0, 0, 1);
    },

    scale: function(x, y, z) {
      return mul.call(this, x, 0, 0, 0,
                            0, y, 0, 0,
                            0, 0, z, 0,
                            0, 0, 0, 1);
    },

    copyToColumnMajorArray: function(array) {
      array[0] = this.m00;
      array[1] = this.m10;
      array[2] = this.m20;
      array[3] = this.m30;

      array[4] = this.m01;
      array[5] = this.m11;
      array[6] = this.m21;
      array[7] = this.m31;

      array[ 8] = this.m02;
      array[ 9] = this.m12;
      array[10] = this.m22;
      array[11] = this.m32;

      array[12] = this.m03;
      array[13] = this.m13;
      array[14] = this.m23;
      array[15] = this.m33;

      return this;
    },
  };
}());

function makeBox(size, attributes) {
  attributes.length = 0;

  var s = size;

  for (var i = 0; i < boxAttributes.length; i += 6) {
    var x = boxAttributes[i + 0];
    var y = boxAttributes[i + 1];
    var z = boxAttributes[i + 2];

    // Position
    attributes.push(s * x);
    attributes.push(s * y);
    attributes.push(s * z);

    var nx = boxAttributes[i + 3];
    var ny = boxAttributes[i + 4];
    var nz = boxAttributes[i + 5];

    // Normal
    attributes.push(nx);
    attributes.push(ny);
    attributes.push(nz);
  }

  return boxAttributes.length / 6;
}

function makeSphere(radius, attributes) {
  var tmpPositions = [];

  var iCount = 24;
  var jCount = 24;

  for (var i = 0; i < iCount; ++i) {
    var theta = i * 2.0 * Math.PI / (iCount - 1);

    for (var j = 0; j < jCount; ++j) {
      var phi = j * Math.PI / (jCount - 1) - 0.5 * Math.PI;

      var x = radius * Math.cos(phi) * Math.cos(theta);
      var y = radius * Math.cos(phi) * Math.sin(theta);
      var z = radius * Math.sin(phi);

      tmpPositions.push({x: x, y: y, z: z});
    }
  }

  attributes.length = 0;
  var vertexCount = 0;

  var indices = [0, 1, 2, 0, 2, 3];

  for (var i = 0; i < iCount - 1; ++i) {
    var i0 = i;
    var i1 = i + 1;

    for (var j = 0; j < jCount; ++j) {
      var j0 = j;
      var j1 = j + 1;

      var P0 = tmpPositions[i0 * jCount + j0];
      var P1 = tmpPositions[i1 * jCount + j0];

      // Position 0
      attributes.push(P0.x);
      attributes.push(P0.y);
      attributes.push(P0.z);

      // Normal 0
      attributes.push(P0.x / radius);
      attributes.push(P0.y / radius);
      attributes.push(P0.z / radius);

      // Position 1
      attributes.push(P1.x);
      attributes.push(P1.y);
      attributes.push(P1.z);

      // Normal 1
      attributes.push(P1.x / radius);
      attributes.push(P1.y / radius);
      attributes.push(P1.z / radius);

      vertexCount += 2;
    }
  }

  return vertexCount;
}

// Position + normal
var boxAttributes = [
  // +z face
  -1, -1,  1,  0,  0,  1,
   1, -1,  1,  0,  0,  1,
   1,  1,  1,  0,  0,  1,

  -1, -1,  1,  0,  0,  1,
   1,  1,  1,  0,  0,  1,
  -1,  1,  1,  0,  0,  1,
  // -z face
   1, -1, -1,  0,  0, -1,
  -1, -1, -1,  0,  0, -1,
   1,  1, -1,  0,  0, -1,

   1,  1, -1,  0,  0, -1,
  -1, -1, -1,  0,  0, -1,
  -1,  1, -1,  0,  0, -1,
  // +x face
   1, -1, -1,  1,  0,  0,
   1,  1, -1,  1,  0,  0,
   1,  1,  1,  1,  0,  0,

   1, -1, -1,  1,  0,  0,
   1,  1,  1,  1,  0,  0,
   1, -1,  1,  1,  0,  0,
  // -x face
  -1,  1, -1, -1,  0,  0,
  -1, -1, -1, -1,  0,  0,
  -1,  1,  1, -1,  0,  0,

  -1,  1,  1, -1,  0,  0,
  -1, -1, -1, -1,  0,  0,
  -1, -1,  1, -1,  0,  0,
  // +y face
  -1,  1, -1,  0,  1,  0,
  -1,  1,  1,  0,  1,  0,
   1,  1,  1,  0,  1,  0,

  -1,  1, -1,  0,  1,  0,
   1,  1,  1,  0,  1,  0,
   1,  1, -1,  0,  1,  0,
  // -y face
  -1, -1,  1,  0, -1,  0,
  -1, -1, -1,  0, -1,  0,
   1, -1,  1,  0, -1,  0,

   1, -1,  1,  0, -1,  0,
  -1, -1, -1,  0, -1,  0,
   1, -1, -1,  0, -1,  0,
];

function createShaderFromSource(gl, shaderType, shaderSource) {
  var shader = gl.createShader(shaderType);

  if (!shader)
    return null;

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function getShaderSource(url) {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', url, false);
  xhr.send();

  if (xhr.status != 200)
    return null;

  return xhr.responseText;
}

function createShaderProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();

  if (!program)
    return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function createProgram(gl, vertexShaderSourceUrl, fragmentShaderSourceUrl) {
  var vertexShaderSource = getShaderSource(vertexShaderSourceUrl);

  if (!vertexShaderSource)
    return null;

  var vertexShader = createShaderFromSource(gl, gl.VERTEX_SHADER,
                                            vertexShaderSource);

  if (!vertexShader) {
    console.log("can't create vertex shader");
    return null;
  }

  var fragmentShaderSource = getShaderSource(fragmentShaderSourceUrl);

  if (!fragmentShaderSource)
    return null;

  var fragmentShader = createShaderFromSource(gl, gl.FRAGMENT_SHADER,
                                              fragmentShaderSource);

  if (!fragmentShader) {
    console.log("can't create fragment shader");
    gl.deleteShader(vertexShader);
    return null;
  }

  var program = createShaderProgram(gl, vertexShader, fragmentShader,
                                    console.log);

  if (!program) {
    console.log("can't create shader program");
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }

//gl.deleteShader(fragmentShader);
//gl.deleteShader(vertexShader);
  return program;
}

function createVertexBuffer(gl, data) {
  var vertexBuffer = gl.createBuffer();
  var array = new Float32Array(data);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return vertexBuffer;
}

Demo.SPHERE_RADIUS = 10;
Demo.SPHERE_DISTANCE = 150;
Demo.BOX_SIZE = 2.5;
Demo.BOX_SPACING = 2 * Demo.BOX_SIZE;
Demo.NUM_BOXES_PER_ROW = 120;
Demo.RANGE_OF_GRAVITY = 200;

Demo.LightVector = [1, 1, 2];

Demo.BoxAmbient = [0.2, 0.2, 0.2];
Demo.BoxDiffuse = [0.7, 0.7, 0.7];

Demo.Spheres = [
  {
    radius: Demo.SPHERE_RADIUS,
    theta: 0,
    distance: 0,
    speed: 1,
    ambient: [0.5, 0.5, 0.0],
    diffuse: [0.75, 0.75, 0.0],
  },
  {
    radius: 0.5 * Demo.SPHERE_RADIUS,
    theta: 2 * Math.random() * Math.PI,
    speed: 1 / 50,
    distance: 0.25 * Demo.SPHERE_DISTANCE,
    ambient: [0.5, 0.25, 0.0],
    diffuse: [0.75, 0.5, 0.0],
  },
  {
    radius: 0.25 * Demo.SPHERE_RADIUS,
    theta: 2 * Math.random() * Math.PI,
    speed: 1 / 100,
    distance: Demo.SPHERE_DISTANCE,
    ambient: [0.5, 0.0, 0.0],
    diffuse: [0.7, 0.0, 0.0],
  },
];

Demo.Uniforms = {};
Demo.Uniforms.MODEL_VIEW_PROJECTION_MATRIX = 0;
Demo.Uniforms.LIGHT_VECTOR = 1;
Demo.Uniforms.AMBIENT = 2;
Demo.Uniforms.DIFFUSE = 3;
Demo.Uniforms.OFFSET = 4;
Demo.Uniforms.SPHERE_POSITION_0 = 5;
Demo.Uniforms.SPHERE_POSITION_1 = 6;
Demo.Uniforms.SPHERE_POSITION_2 = 7;
Demo.Uniforms.COUNT = 8;
Demo.UniformNames = [
  'uModelViewProjectionMatrix',
  'uLightVector',
  'uAmbient',
  'uDiffuse',
  'uOffset',
  'uSpherePositions[0]',
  'uSpherePositions[1]',
  'uSpherePositions[2]',
];

Demo.Attributes = {};
Demo.Attributes.POSITION = 0;
Demo.Attributes.NORMAL = 1;
Demo.Attributes.COUNT = 2;
Demo.AttributeNames = [
  'aPosition',
  'aNormal',
];

function Demo(canvas, gl) {
  this.canvas = canvas;
  this.gl = gl;

  this.boxBuffer = null;
  this.boxVertexCount = 0;

  this.sphereBuffers = new Array(Demo.Spheres.length);
  this.sphereVertexCounts = new Array(Demo.Spheres.length);

  this.program = null;
  this.uniformLocations = new Array(Demo.Uniforms.COUNT);
  this.attribLocations = new Array(Demo.Attributes.COUNT);

  this.mouseX = this.canvas.width / 2;
  this.mouseY = this.canvas.height / 2;

  this.mvpMatrix = new Matrix4x4();
  this.mvpArray = new Array(16);

  this.spherePositions = [
    {x: 0, y: 0},
    {x: 0, y: 0},
    {x: 0, y: 0},
  ];
  this.spherePositionArray = new Array(2 * Demo.Spheres.length);

  this.frameCount = 0;
}

Demo.prototype.initBuffers = function() {
  var gl = this.gl;

  var s = Demo.BOX_SIZE;
  var boxAttributes = [];
  this.boxVertexCount = makeBox(s, boxAttributes);
  this.boxBuffer = createVertexBuffer(gl, boxAttributes);

  for (var i = 0; i < Demo.Spheres.length; ++i) {
    var r = Demo.Spheres[i].radius;
    var sphereAttributes = [];
    this.sphereVertexCounts[i] = makeSphere(r, sphereAttributes);
    this.sphereBuffers[i] = createVertexBuffer(gl, sphereAttributes);
  }

  console.log('# of sphere vertices: ' + this.sphereVertexCount);
}

Demo.prototype.initShaders = function() {
  var gl = this.gl;

  this.program = createProgram(gl, 'gravity-plus.vert', 'gravity-plus.frag');

  if (!this.program)
    return;

  this.uniformLocations = [
    gl.getUniformLocation(this.program,
      Demo.UniformNames[Demo.Uniforms.MODEL_VIEW_PROJECTION_MATRIX]),
    gl.getUniformLocation(this.program,
      Demo.UniformNames[Demo.Uniforms.LIGHT_VECTOR]),
    gl.getUniformLocation(this.program,
      Demo.UniformNames[Demo.Uniforms.AMBIENT]),
    gl.getUniformLocation(this.program,
      Demo.UniformNames[Demo.Uniforms.DIFFUSE]),
    gl.getUniformLocation(this.program,
      Demo.UniformNames[Demo.Uniforms.OFFSET]),
    gl.getUniformLocation(this.program,
      Demo.UniformNames[Demo.Uniforms.SPHERE_POSITION_0]),
    gl.getUniformLocation(this.program,
      Demo.UniformNames[Demo.Uniforms.SPHERE_POSITION_1]),
    gl.getUniformLocation(this.program,
      Demo.UniformNames[Demo.Uniforms.SPHERE_POSITION_2]),
  ];

  this.attribLocations = [
    gl.getAttribLocation(this.program,
      Demo.AttributeNames[Demo.Attributes.POSITION]),
    gl.getAttribLocation(this.program,
      Demo.AttributeNames[Demo.Attributes.NORMAL]),
  ];
}

Demo.prototype.init = function() {
  var gl = this.gl;

  gl.viewport(0, 0, this.canvas.width, this.canvas.height);

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clearDepth(1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  this.initBuffers();
  this.initShaders();

  console.log('uniforms: ' + this.uniformLocations);
  console.log('attributes: ' + this.attribLocations);

  var location = this.attribLocations[Demo.Attributes.POSITION];
  gl.enableVertexAttribArray(location);

  location = this.attribLocations[Demo.Attributes.NORMAL];
  gl.enableVertexAttribArray(location);
}

Demo.prototype.mainLoop = function() {
  var that = this;

  that.init();

  function handleMouse(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    that.mouse(x, y);
  }

  window.addEventListener('mousemove', handleMouse, false);
  function animationLoop() {
    that.display();
    window.requestAnimationFrame(animationLoop, that.canvas);
  }

  window.requestAnimationFrame(animationLoop, this.canvas, animationLoop);
}

Demo.prototype.mouse = function(x, y) {
  this.mouseX = x;
  this.mouseY = y;
}

Demo.prototype.updateState = function() {
  var canvas = this.canvas;
  var width = canvas.width;
  var height = canvas.height;

  var thetaX = 1.5 * Math.PI - (this.mouseY / height - 0.5);
  var thetaZ = 2.0 * Math.PI - (2.0 * Math.PI * (this.mouseX / width) + Math.PI);

  var mvpMatrix = this.mvpMatrix;
  var mvpArray = this.mvpArray;

  mvpMatrix.identity();
  mvpMatrix.perspective(60.0, width / height, 0.1, 5000.0);
  mvpMatrix.translate(0.0, 0.0, -300.0);
  mvpMatrix.rotate(thetaX, 1.0, 0.0, 0.0);
  mvpMatrix.rotate(thetaZ, 0.0, 0.0, 1.0);
  mvpMatrix.copyToColumnMajorArray(mvpArray);

  var frameCount = this.frameCount;
  var spherePositions = this.spherePositions;
  var spherePositionArray = this.spherePositionArray;

  for (var i = 0, j = 0; i < Demo.Spheres.length; ++i) {
    var theta = Demo.Spheres[i].theta;
    var distance = Demo.Spheres[i].distance;
    var speed = Demo.Spheres[i].speed;

    var x0 = Math.sin(frameCount * speed + theta) * distance;
    var y0 = Math.cos(frameCount * speed + theta) * distance;

    spherePositions[i].x = x0;
    spherePositions[i].y = y0;
    spherePositionArray[j++] = x0;
    spherePositionArray[j++] = y0;
  }
}

Demo.prototype.updateUniforms = function() {
  var gl = this.gl;

  var l = this.uniformLocations[Demo.Uniforms.MODEL_VIEW_PROJECTION_MATRIX];
  var mvpArray = this.mvpArray;
  gl.uniformMatrix4fv(l, false, mvpArray);

  l = this.uniformLocations[Demo.Uniforms.LIGHT_VECTOR];
  gl.uniform3fv(l, Demo.LightVector);

  l = this.uniformLocations[Demo.Uniforms.SPHERE_POSITION_0];
  gl.uniform2fv(l, this.spherePositionArray.slice(0, 2));

  l = this.uniformLocations[Demo.Uniforms.SPHERE_POSITION_1];
  gl.uniform2fv(l, this.spherePositionArray.slice(2, 4));

  l = this.uniformLocations[Demo.Uniforms.SPHERE_POSITION_2];
  gl.uniform2fv(l, this.spherePositionArray.slice(4, 6));
}

Demo.prototype.updateMaterialUniforms = function(ambient, diffuse) {
  var gl = this.gl;

  var l = this.uniformLocations[Demo.Uniforms.AMBIENT];
  gl.uniform3fv(l, ambient);

  l = this.uniformLocations[Demo.Uniforms.DIFFUSE];
  gl.uniform3fv(l, diffuse);
}

Demo.prototype.updateOffsetUniforms = function(offset) {
  var gl = this.gl;

  var l = this.uniformLocations[Demo.Uniforms.OFFSET];
  gl.uniform3fv(l, offset);
}

Demo.prototype.updateAttributes = function(buffer) {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  var location = this.attribLocations[Demo.Attributes.POSITION];
  gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 6 * 4, 0);

  location = this.attribLocations[Demo.Attributes.NORMAL];
  gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
}

Demo.prototype.renderGraphics = function() {
  var gl = this.gl;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(this.program);

  // Update modelview / projection matrix, light vector and sphere positions
  this.updateUniforms();

  // Draw boxes
  this.updateAttributes(this.boxBuffer);

  var l = Demo.BOX_SPACING;
  var n = Demo.NUM_BOXES_PER_ROW;
  var g = Demo.RANGE_OF_GRAVITY;

  for (var i = 0; i < n; ++i) {
    for (var j = 0; j < n; ++j) {
      var x1 = l * i + l / 2 - l * n / 2;
      var y1 = l * j + l / 2 - l * n / 2;

      this.updateOffsetUniforms([x1, y1, 1]);
      this.updateMaterialUniforms(Demo.BoxAmbient, Demo.BoxDiffuse);
      gl.drawArrays(gl.TRIANGLES, 0, this.boxVertexCount);
    }
  }

  // Draw spheres
  for (var i = 0; i < Demo.Spheres.length; ++i) {
    var spherePosition = this.spherePositions[i];
    var x = spherePosition.x;
    var y = spherePosition.y;

    this.updateAttributes(this.sphereBuffers[i]);
    this.updateOffsetUniforms([x, y, 0]);
    this.updateMaterialUniforms(Demo.Spheres[i].ambient,
                                Demo.Spheres[i].diffuse);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.sphereVertexCounts[i]);
  }

  ++this.frameCount;
}

Demo.prototype.display = function() {
  this.updateState();
  this.renderGraphics();
}

function load() {
  var canvas = document.getElementById('canvas');

  if (!canvas)
    return;

  var gl = canvas.getContext('webgl', {antialias: true});

  if (!gl)
    return;

  console.log('multisampling: ' + gl.getContextAttributes().antialias)

  var demo = new Demo(canvas, gl)
  demo.mainLoop();
}
