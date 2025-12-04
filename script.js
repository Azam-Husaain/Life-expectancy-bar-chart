
const margin = { top: 40, right: 30, bottom: 80, left: 60 };

const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3
  .select("#chart")          
  .append("svg")           
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")            
  .attr("transform", `translate(${margin.left},${margin.top})`);


const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip");

d3.csv("merged_life_expectancy_dataset.csv").then(function (data) {

  console.log("First few rows of the dataset:", data.slice(0, 5));
 data.forEach(function (d) {
    d.year = +d.year;                     
    d.life_expectancy = +d.life_expectancy;
  });

  let filtered = data.filter(function (d) {
    return d.year === 2015 && !isNaN(d.life_expectancy);
  });

  filtered.sort(function (a, b) {
    return a.life_expectancy - b.life_expectancy;
  });

  const bottom10 = filtered.slice(0, 10);

  console.log("Bottom 10 countries in 2015:", bottom10);


  const x = d3
    .scaleBand()
    .domain(bottom10.map(function (d) { return d.country; }))
    .range([0, width])
    .padding(0.2);  // space between bars

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bottom10, function (d) { return d.life_expectancy; })])
    .nice()       
    .range([height, 0]); 

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .attr("text-anchor", "end");

  
  svg
    .append("g")
    .call(d3.axisLeft(y));


  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 60)
    .attr("text-anchor", "middle")
    .text("Country");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .text("Life expectancy (years)");

  
  svg
    .selectAll(".bar")
    .data(bottom10)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) { return x(d.country); })
    .attr("width", x.bandwidth())
    .attr("y", height)
    .attr("height", 0)
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(
          "<strong>" + d.country + "</strong><br/>" +
          "Life expectancy (2015): " + d.life_expectancy.toFixed(1) + " years"
        );
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    })
    .transition()
    .duration(1000)   // 1000 ms = 1 second
    .attr("y", function (d) { return y(d.life_expectancy); })
    .attr("height", function (d) { return height - y(d.life_expectancy); });
});

