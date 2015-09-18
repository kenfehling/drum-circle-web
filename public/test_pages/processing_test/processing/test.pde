int counter;

void setup() {  //setup function called initially, only once
  size(320, 320);
  background(0,0,0,0);  // transparent background
  colorMode(HSB);   //set colors to Hue, Saturation, Brightness mode
  counter = 0;
}

void mousePressed() {  // works on mobile
	drawText("Pressed");
}

void draw() {  //draw function loops
  counter++;
  noStroke();
  fill(random(255),100,255,50);

  if(mousePressed == true) {  // doesn't work on mobile
    ellipse(mouseX, mouseY, 50, 50);
  }
  else {
    ellipse(width/2, height/2, 80*sin(counter), 80*sin(counter));
  }
}

void drawText(String t) {
	background(0,0,0,0);
	fill(0,0,0);
	textSize(24);
	float twidth = textWidth(t);
	text(t, (width - twidth)/2, height/2 + twidth/2);
}