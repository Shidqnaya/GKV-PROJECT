const settings = {
  dimensions: [1200, 600]
};

const data = [
  ['Bazarhatnur', 823, 526.72],
  ['Shankarampally', 372, 238.08],
  ['Himayanagar', 443, 283.52],
  ['Gollapalli', 817, 522.88],
  ['Singarajupalli', 1490, 953.60],
  ['Dharoor', 2134, 1365.76],
  ['Bhiknoor', 1334, 853.76],
  ['Gangadhara', 890, 569.60],
  ['Kallur', 1152, 737.28],
  ['Kagaznagar', 699, 447.36]
];

const maxBarHeight = 2200; // Maximum value for the bar parameter
const maxLineHeight = 2200; // Maximum value for the line parameter

const margin = 50;
let barWidth;

function setup() {
  createCanvas(settings.dimensions[0], settings.dimensions[1]);
  barWidth = (width - 2 * margin) / data.length;
}

function draw() {
  background(255);

  // Draw title
  const title = 'Bar and Line Plot';
  textAlign(CENTER);
  textSize(20);
  textStyle(NORMAL); // Ensure normal text style
  noStroke(); // Disable stroke for text
  fill(0);
  text(title, width / 2, margin / 2);

  // Draw bars and line points
  const linePoints = [];

  data.forEach((d, i) => {
    const [city, barValue, lineValue] = d;

    const barHeight = (barValue / maxBarHeight) * (height - 2 * margin);
    const lineHeight = (lineValue / maxLineHeight) * (height - 2 * margin);

    const x = margin + i * barWidth + barWidth / 2;
    const barTop = height - margin - barHeight;
    const lineY = height - margin - lineHeight;

    // Draw bar
    fill('green');
    rect(x - barWidth / 4, barTop, barWidth / 2, barHeight);

    // Save line point
    linePoints.push({ x, y: lineY });

    // Draw city name
    fill(0);
    textAlign(CENTER);
    textSize(15);
    textStyle(NORMAL); // Ensure normal text style
    noStroke(); // Disable stroke for text
    text(city, x, height - margin + 20);
  });

  // Draw line connecting points
  noFill(); // Ensure no fill for the line
  stroke('red');
  strokeWeight(3);
  beginShape();

  linePoints.forEach(point => {
    vertex(point.x, point.y);
  });

  endShape();

  // Draw points on the line
  linePoints.forEach(point => {
    fill('red');
    noStroke(); // Disable stroke for points
    ellipse(point.x, point.y, 10, 10);
    stroke('red'); // Re-enable stroke for line
  });

  // Draw axes
  stroke(0);
  strokeWeight(2);

  // Y-axis
  line(margin, margin, margin, height - margin);

  // X-axis
  line(margin, height - margin, width - margin, height - margin);

  // Y-axis ticks and labels
  const numTicks = 10;
  const tickLength = 5;
  const tickValueGap = maxBarHeight / numTicks;

  textAlign(RIGHT);
  textSize(12);
  textStyle(NORMAL); // Ensure normal text style
  noStroke(); // Disable stroke for text

  for (let i = 0; i <= numTicks; i++) {
    const value = i * tickValueGap;
    const y = height - margin - (value / maxBarHeight) * (height - 2 * margin);

    // Draw tick
    stroke(0); // Re-enable stroke for tick
    line(margin - tickLength, y, margin, y);

    // Draw label
    noStroke(); // Disable stroke for text
    fill(0);
    text(value.toFixed(0), margin - tickLength - 5, y + 3);
  }

  // Draw legend
  const legendX = width - margin - 120;
  const legendY = margin;
  const legendSpacing = 20;
  const legendTextOffset = 25;

  fill(0);
  textSize(14);
  textAlign(LEFT);
  textStyle(NORMAL); // Ensure normal text style
  noStroke(); // Disable stroke for text
  text('Legend:', legendX, legendY);

  // Bar legend
  fill('green');
  rect(legendX, legendY + legendSpacing, 15, 15);
  fill(0);
  text('Electrical Conductivity', legendX + legendTextOffset, legendY + legendSpacing + 12);

  // Line point legend
  fill('red');
  noStroke(); // Disable stroke for ellipse
  ellipse(legendX + 7.5, legendY + 2 * legendSpacing + 7.5, 15, 15);
  fill(0);
  text('Total Dissolved Solids', legendX + legendTextOffset, legendY + 2 * legendSpacing + 12);
}
