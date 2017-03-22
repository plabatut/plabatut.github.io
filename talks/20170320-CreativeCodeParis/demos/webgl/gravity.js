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

function makeBox(size, positions, normals) {
  positions.length = 0;
  normals.length = 0;

  var s = size;

  for (var i = 0; i < boxPositions.length; i += 3) {
    var x = boxPositions[i + 0];
    var y = boxPositions[i + 1];
    var z = boxPositions[i + 2];

    positions.push(s * x);
    positions.push(s * y);
    positions.push(s * z);

    var nx = boxNormals[i + 0];
    var ny = boxNormals[i + 1];
    var nz = boxNormals[i + 2];

    normals.push(nx);
    normals.push(ny);
    normals.push(nz);
  }

  return boxPositions.length / 3;
}

function makeSphere(radius, positions, normals) {
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

  positions.length = 0;
  normals.length = 0;
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

      positions.push(P0.x);
      positions.push(P0.y);
      positions.push(P0.z);

      positions.push(P1.x);
      positions.push(P1.y);
      positions.push(P1.z);

      normals.push(P0.x / radius);
      normals.push(P0.y / radius);
      normals.push(P0.z / radius);

      normals.push(P1.x / radius);
      normals.push(P1.y / radius);
      normals.push(P1.z / radius);

      vertexCount += 2;
    }
  }

  return vertexCount;
}

var boxPositions = [
  // +z face
  -1, -1,  1,
   1, -1,  1,
   1,  1,  1,

  -1, -1,  1,
   1,  1,  1,
  -1,  1,  1,
  // -z face
   1, -1, -1,
  -1, -1, -1,
   1,  1, -1,

   1,  1, -1,
  -1, -1, -1,
  -1,  1, -1,
  // +x face
   1, -1, -1,
   1,  1, -1,
   1,  1,  1,

   1, -1, -1,
   1,  1,  1,
   1, -1,  1,
  // -x face
  -1,  1, -1,
  -1, -1, -1,
  -1,  1,  1,

  -1,  1,  1,
  -1, -1, -1,
  -1, -1,  1,
  // +y face
  -1,  1, -1,
  -1,  1,  1,
   1,  1,  1,

  -1,  1, -1,
   1,  1,  1,
   1,  1, -1,
  // -y face
  -1, -1,  1,
  -1, -1, -1,
   1, -1,  1,

   1, -1,  1,
  -1, -1, -1,
   1, -1, -1,
];

var boxNormals = [
  // +z face
   0,  0,  1,
   0,  0,  1,
   0,  0,  1,

   0,  0,  1,
   0,  0,  1,
   0,  0,  1,
  // -z face
   0,  0, -1,
   0,  0, -1,
   0,  0, -1,

   0,  0, -1,
   0,  0, -1,
   0,  0, -1,
  // +x face
   1,  0,  0,
   1,  0,  0,
   1,  0,  0,

   1,  0,  0,
   1,  0,  0,
   1,  0,  0,
  // -x face
  -1,  0,  0,
  -1,  0,  0,
  -1,  0,  0,

  -1,  0,  0,
  -1,  0,  0,
  -1,  0,  0,
  // +y face
   0,  1,  0,
   0,  1,  0,
   0,  1,  0,
       
   0,  1,  0,
   0,  1,  0,
   0,  1,  0,
  // -y face
   0, -1,  0,
   0, -1,  0,
   0, -1,  0,
      -
   0, -1,  0,
   0, -1,  0,
   0, -1,  0,
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
Demo.BOX_SPACING = 10;
Demo.BOX_SIZE = 5;
Demo.NUM_BOXES_PER_ROW = 35;
Demo.RANGE_OF_GRAVITY = 200;

Demo.LightVector = [1, 1, 2];

Demo.BoxAmbient = [0.2, 0.2, 0.2];
Demo.BoxDiffuse = [0.7, 0.7, 0.7];

Demo.SphereAmbient = [0.5, 0.0, 0.0];
Demo.SphereDiffuse = [0.75, 0.0, 0.0];

Demo.Uniforms = {};
Demo.Uniforms.MODEL_VIEW_PROJECTION_MATRIX = 0;
Demo.Uniforms.LIGHT_VECTOR = 1;
Demo.Uniforms.AMBIENT = 2;
Demo.Uniforms.DIFFUSE = 3;
Demo.Uniforms.OFFSET = 4;
Demo.Uniforms.COUNT = 5;
Demo.UniformNames = [
  'uModelViewProjectionMatrix',
  'uLightVector',
  'uAmbient',
  'uDiffuse',
  'uOffset',
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

  this.boxPositionBuffer = null;
  this.boxNormalBuffer = null;
  this.boxVertexCount = 0;

  this.spherePositionBuffer = null;
  this.sphereNormalBuffer = null;
  this.sphereVertexCount = 0;

  this.program = null;
  this.uniformLocations = new Array(Demo.Uniforms.COUNT);
  this.attribLocations = new Array(Demo.Attributes.COUNT);

  this.mouseX = this.canvas.width / 2;
  this.mouseY = this.canvas.height / 2;

  this.mvpMatrix = new Matrix4x4();
  this.mvpArray = new Array(16);

  this.frameCount = 0;
}

Demo.prototype.initBuffers = function() {
  var gl = this.gl;

  var r = Demo.SPHERE_RADIUS;
  var s = Demo.BOX_SIZE;

  var boxPositions = [];
  var boxNormals = [];
  this.boxVertexCount = makeBox(s, boxPositions, boxNormals);
  this.boxPositionBuffer = createVertexBuffer(gl, boxPositions);
  this.boxNormalBuffer = createVertexBuffer(gl, boxNormals);

  var spherePositions = [];
  var sphereNormals = [];
  this.sphereVertexCount = makeSphere(r, spherePositions, sphereNormals);
  this.spherePositionBuffer = createVertexBuffer(gl, spherePositions);
  this.sphereNormalBuffer = createVertexBuffer(gl, sphereNormals);

  console.log('# of sphere vertices: ' + this.sphereVertexCount);
}

Demo.prototype.initShaders = function() {
  var gl = this.gl;

  this.program = createProgram(gl, 'gravity.vert', 'gravity.frag');

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
}

Demo.prototype.updateUniforms = function() {
  var gl = this.gl;

  var location = this.uniformLocations[Demo.Uniforms.MODEL_VIEW_PROJECTION_MATRIX];
  var mvpArray = this.mvpArray;
  gl.uniformMatrix4fv(location, false, mvpArray);

  location = this.uniformLocations[Demo.Uniforms.LIGHT_VECTOR];
  gl.uniform3fv(location, Demo.LightVector);
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

Demo.prototype.updateAttributes = function(positionBuffer, normalBuffer) {
  var gl = this.gl;

  var location = this.attribLocations[Demo.Attributes.POSITION];

  if (location >= 0) {
    gl.enableVertexAttribArray(location);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 3 * 4, 0);
  }

  location = this.attribLocations[Demo.Attributes.NORMAL];

  if (location >= 0) {
    gl.enableVertexAttribArray(location);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 3 * 4, 0);
  }
}

Demo.prototype.renderGraphics = function() {
  var gl = this.gl;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(this.program);

  this.updateUniforms();

  var x0 = Math.sin(this.frameCount / 50) * 100;
  var y0 = Math.cos(this.frameCount / 50) * 100;

  // Draw boxes
  this.updateAttributes(this.boxPositionBuffer, this.boxNormalBuffer);
  var boxDiffuse = [0, 0, 0];

  var l = Demo.BOX_SPACING;
  var n = Demo.NUM_BOXES_PER_ROW;
  var g = Demo.RANGE_OF_GRAVITY;

  for (var i = 0; i < n; ++i) {
    for (var j = 0; j < n; ++j) {
      var x1 = l * i + l / 2 - l * n / 2;
      var y1 = l * j + l / 2 - l * n / 2;
      var dx = x1 - x0;
      var dy = y1 - y0;

      var distance = Math.sqrt(dx * dx + dy * dy);
      distance = distance > g ? 0 : Math.tan(((g - distance) / g) * 0.5 * Math.PI) * (-g / 4);

      var z1 = distance / 10;
      var value = (200 + 2 * z1) / 255;
      value = Math.max(value, 0);
      boxDiffuse[0] = value;
      boxDiffuse[1] = value;
      boxDiffuse[2] = value;

      this.updateOffsetUniforms([x1, y1, z1]);
      this.updateMaterialUniforms(Demo.BoxAmbient, boxDiffuse);
      gl.drawArrays(gl.TRIANGLES, 0, this.boxVertexCount);
    }
  }

  // Draw sphere
  this.updateOffsetUniforms([x0, y0, 0]);
  this.updateMaterialUniforms(Demo.SphereAmbient, Demo.SphereDiffuse);
  this.updateAttributes(this.spherePositionBuffer, this.sphereNormalBuffer);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.sphereVertexCount);

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

  var gl = canvas.getContext('webgl', {antialias: false});

  if (!gl)
    return;

  var demo = new Demo(canvas, gl)
  demo.mainLoop();
}
