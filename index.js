/*
  tags: basic

 <p> This example shows how to use copyTexImage2D to implement feedback effects </p>
 */

const regl = require('regl')()
const mouse = require('mouse-change')()

const pixels = regl.texture()

let scale = 1

const drawFeedback = regl({
  frag: `
  precision highp float;
  uniform sampler2D texture;
  uniform vec2 mouse;
  uniform float scale;
  varying vec2 uv;

  vec3 color(float intensity){
    return vec3(pow(intensity, 0.8));
  }

  float julia(vec2 z, vec2 c) {
    const int ITER = 900;
    const float B = 2.0;

    float n = 0.0;
    for(int i = 0; i < ITER; i++) {
      if(dot(z,z) >= B*B) break;
      
      float x = z.x*z.x - z.y*z.y;
      z.y = 2.0*z.x*z.y + c.y;
      z.x = x + c.x;
      n += 1.0;
    }
    float sn = n - log(log(length(z))/log(B))/log(2.0);
    return sn / float(ITER);
  }

  void main () {
    vec2 c = mouse * vec2(3.0,2.0) - vec2(1.5, 1.0);
    vec2 z = uv * vec2(3.0,2.0) - vec2(1.5, 1.0);
    float d = julia(z/scale, c);
    // float d = mandel(uv, mouse);
    gl_FragColor = vec4(color(d), 1.0);
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`,

  attributes: {
    position: [
      -2, 0,
      0, -2,
      2, 2]
  },

  uniforms: {
    texture: pixels,
    mouse: ({pixelRatio, viewportHeight, viewportWidth }) => [
      pixelRatio * mouse.x / viewportWidth,
      1 - pixelRatio * mouse.y / viewportHeight
    ],
    scale
  },

  count: 3
})

regl.frame(function () {
  regl.clear({
    color: [0, 0, 0, 1]
  })

  drawFeedback()

  pixels({
    copy: true
  })
})