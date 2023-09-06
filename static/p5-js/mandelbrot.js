// マンデルブロどうやるんだっけ
// 漸化式z_n+1 = z_n^2 + cで何回かやって発散しない点の集合だそうです
// cは複素数
// 100回くらいやってどの範囲を出ないかとかそんな感じ
// たとえば100回やって±10を出ないとかそんな感じ？？
// 具体的に証明できるらしいんだけど
// ±2くらいの範囲に収まるんだって
// でもって途中で絶対値が2を超えたらアウトらしい
// それで計算できる
// 64くらいでいいか
// (u+vi) = (x+yi)^2 + (c1 + c2i)
// u = x^2 - y^2 + c1;
// v = 2xy + c2;

// あれ？？？

// ごめんなさい複素数の掛け算をベクトルで書いちゃった（てへ！！）
// ばかか
// hを線形で減らすのがまずいっぽい
// breakしたときのqの値に応じてなんかするかもしくはhの減り方を・・んー。
// マウスをダウンするとその点を中心とする正方形が・・サイズ指定して・・んー。
// 全体を右側に用意して左側に？？んー。虫眼鏡的な。
// クリックするたびにその範囲で拡大されたあれがもう片方に表示されるイメージ。
// 800x400にして400x400をふたつ用意してってやる。
// 下の方にその、あれを・・する。で、再計算！する感じ。わかる？？？？？

// 1024x576にして512との差の部分でコンフィグ。以上。

const SIZE = 1112;
const SIZE2 = 834;
let myShader;
let vs =
"precision mediump float;" +
"attribute vec3 aPosition;" +
"void main(void){" +
"  gl_Position = vec4(aPosition, 1.0);" +
"}";

let fs =
"precision mediump float;" +
"uniform vec2 u_resolution;" +
"uniform float u_count;" +
"const int limit = 64;" +
"const float pi = 3.14159;" +
// hsbで書かれた(0.0～1.0)の数値vec3をrgbに変換する魔法のコード
"vec3 getRGB(float h, float s, float b){" +
"  vec3 c = vec3(h, s, b);" +
"  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);" +
"  rgb = rgb * rgb * (3.0 - 2.0 * rgb);" +
"  return c.z * mix(vec3(1.0), rgb, c.y);" +
"}" +
"vec3 getMB(in vec2 p){" +
// pの位置に応じて64回の計算を行なう
// 64回やっても±2を出なければ合格とする
// 出てしまった場合にその時の回数を使って色付けする感じ
// 綺麗な青から黒へ向かわせる（64で黒）
"  float h = 1.0;" +
"  vec2 q = vec2(0.0);" +
"  vec2 r;" +
"  bool outFlag = false;" +
"  for(int i = 0; i < limit; i++){" +
"    r.x = q.x * q.x - q.y * q.y + p.x;" +
"    r.y = 2.0 * q.x * q.y + p.y;" +
"    q.x = r.x;" +
"    q.y = r.y;" +
"    h -= 1.0 / 64.0;" +
"    if(q.x * q.x + q.y * q.y > 4.0){ outFlag = true; break; }" +
"  }" +
"  if(outFlag){" +
"    float theta = atan(q.y, q.x) + pi;" +
"    float radiusFactor = 2.0 / length(q);" +
"    float hue = u_count / 200.0 + sin(theta) * 0.15;" +
"    if(hue < 0.0){ hue += 1.0; }" +
"    if(hue > 1.0){ hue -= 1.0; }" +
"    return getRGB(hue, h, radiusFactor);" +
"  }" +
"  return vec3(length(q) / 2.0, 0.5 + 0.5 * sin(u_count * pi / 50.0), 0.5 + 0.5 * cos(u_count * pi / 50.0));" +
"}" +
"void main(void){" +
"  vec2 p = (gl_FragCoord.xy - u_resolution.xy) * 1.5 / u_resolution.xy;" + // ±2の範囲に正規化
"  p.x -= 0.4;" +
"  vec3 col = getMB(p);" +
"  gl_FragColor = vec4(col, 1.0);" +
"}";

let gr;
let properFrameCount = 0;

function setup(){
  createCanvas(SIZE, SIZE2);
  gr = createGraphics(SIZE, SIZE2, WEBGL);
  myShader = gr.createShader(vs, fs);
  gr.shader(myShader);
  //frameRate(30);
}

function draw(){
  background(0);
  myShader.setUniform("u_resolution", [SIZE, SIZE2]);
  myShader.setUniform("u_count", properFrameCount % 200);
  gr.quad(-1, -1, -1, 1, 1, 1, 1, -1);
  image(gr, 0, 0);
  //noLoop();
  properFrameCount++;
}
