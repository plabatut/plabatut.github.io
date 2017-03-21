'use strict';

var I_RESOLUTION = 0;
var I_GLOBAL_TIME = 1;
var I_MOUSE = 2;

var A_POSITION = 0;

var VERTEX_SHADER_SOURCE = '' +
  'attribute vec3 aPosition;                                             \n' +
  '                                                                      \n' +
  'void main() {                                                         \n' +
  '    gl_Position = vec4(aPosition, 1.0);                               \n' +
  '}'


var FRAGMENT_SHADER_SOURCE_HEADER = '' +
  'precision highp float;                                                \n' +
  '                                                                      \n' +
  'uniform vec3 iResolution;                                             \n' +
  'uniform float iGlobalTime;                                            \n' +
  'uniform vec4 iMouse;                                                  \n'

var FRAGMENT_SHADER_SOURCE_FOOTER = '                                \
void main() {                                                        \
    mainImage(gl_FragColor, gl_FragCoord.xy);                        \
}'

function Demo(canvas, gl, url) {
  this.canvas = canvas;
  this.gl = gl;
  this.url = url;

  this.program = null;
  this.uniformLocations = [null, null, null];
  this.attribLocations = [null];

  this.vertexBuffers = [null];
  this.indexBuffer = null;
  this.indexCount = 0;

  this.firstDisplayTime = 0.0;
}

Demo.prototype.init = function() {
  var gl = this.gl;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);

  gl.viewport(0, 0, this.canvas.width, this.canvas.height);

  var buffers = createBuffers(gl);
  var program = createProgram(gl, this.url);

  if (!program)
    return;

  this.program = program;

  this.uniformLocations = [
    gl.getUniformLocation(program, 'iResolution'),
    gl.getUniformLocation(program, 'iGlobalTime'),
    gl.getUniformLocation(program, 'iMouse'),
  ];

  this.attribLocations = [
    gl.getAttribLocation(program, 'aPosition'),
  ];

  gl.useProgram(this.program);

  this.vertexBuffers = [buffers.vertexBuffer];
  this.indexBuffer = buffers.indexBuffer;
  this.indexCount = buffers.indexCount;

  gl.enableVertexAttribArray(this.attribLocations[A_POSITION]);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[0]);
  gl.vertexAttribPointer(this.attribLocations[A_POSITION],
                         3, gl.FLOAT, false, 3 * 4, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  this.firstDisplayTime = Date.now() / 1000.0;
}

Demo.prototype.updateState = function() {
}

Demo.prototype.renderGraphics = function() {
  var gl = this.gl;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var width = this.canvas.width;
  var height = this.canvas.height;
  var depth = 0.0;

  var time = Date.now() / 1000.0 - this.firstDisplayTime;

  var motionX = 0.0;
  var motionY = 0.0;
  var clickX = 0.0;
  var clickY = 0.0;

  gl.uniform3f(this.uniformLocations[I_RESOLUTION], width, height, depth);
  gl.uniform1f(this.uniformLocations[I_GLOBAL_TIME], time);
  gl.uniform4f(this.uniformLocations[I_MOUSE],
               motionX, motionY, clickX, clickY);

  gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
}

Demo.prototype.display = function() {
  this.updateState();
  this.renderGraphics();
}

Demo.prototype.mainLoop = function() {
  var that = this;

  that.init();

  function animationLoop() {
    that.display();
    window.requestAnimationFrame(animationLoop, that.canvas);
  }

  window.requestAnimationFrame(animationLoop, this.canvas, animationLoop);
}

function createBuffers(gl) {
  var vertexBuffer = gl.createBuffer();
  var vertexArray = new Float32Array([
    -1, -1,  0,
     1, -1,  0,
     1,  1,  0,
    -1,  1,  0,
  ]);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

  var indexBuffer = gl.createBuffer();
  var indexArray = new Uint16Array([
     0,  1,  2, 
     2,  3,  0, 
  ]);
  var indexCount = indexArray.length;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

  return {
    vertexBuffer: vertexBuffer,
    indexBuffer: indexBuffer,
    indexCount: indexCount
  };
}

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

function createShaderProgram(gl, vertexShader, fragmentShader, attribNames) {
  var program = gl.createProgram();

  if (!program)
    return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  if (attribNames)
    for (var i in attribNames)
      if (attribNames.hasOwnProperty(i))
        gl.bindAttribLocation(program, i, attribNames[i]);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

//gl.deleteShader(fragmentShader);
//gl.deleteShader(vertexShader);
  return program;
}

function createProgram(gl, url) {
  var vertexShader = createShaderFromSource(gl, gl.VERTEX_SHADER,
                                            VERTEX_SHADER_SOURCE,
                                            console.log);

  if (!vertexShader) {
    console.log("can't create vertex shader");
    return null;
  }

  var shaderSource = getShaderSource(url);

  if (!shaderSource)
    return null;

  var fragmentShaderSource =
    FRAGMENT_SHADER_SOURCE_HEADER +
    shaderSource +
    FRAGMENT_SHADER_SOURCE_FOOTER;

  var fragmentShader = createShaderFromSource(gl, gl.FRAGMENT_SHADER,
                                              fragmentShaderSource,
                                              console.log);

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

  return program;
}

function load(url) {
  var canvas = document.getElementById('canvas');

  if (!canvas)
    return;

  var gl = canvas.getContext('webgl');

  if (!gl)
    return;

  var demo = new Demo(canvas, gl, url)
  demo.mainLoop();
}
