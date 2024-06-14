function handleFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        console.error('No file selected.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const csvData = event.target.result;
        parseCSV(csvData);
    };
    reader.readAsText(file);
}

function createCombinedBubbleChart(parsedData) {
    const districtsData = {};

    // Group data by district
    parsedData.data.forEach(row => {
        if (!districtsData[row.district]) {
            districtsData[row.district] = [];
        }
        districtsData[row.district].push({
            gwl: parseFloat(row.gwl),
            pH: parseFloat(row.pH),
            Na: parseFloat(row.Na)
        });
    });

    const traces = [];
    const villageColors = {}; // Store colors for each district

    // Loop through each district
    Object.keys(districtsData).forEach(district => {
        const districtData = districtsData[district];

        // Calculate mode or average GWL and pH for the district
        const gwlValues = districtData.map(village => village.gwl);
        const pHValues = districtData.map(village => village.pH);
        const NaValues = districtData.map(village => village.Na);
        const gwlMedian = calculateMedian(gwlValues);
        const pHMedian = calculateMedian(pHValues);
        const NaMedian = calculateMedian(NaValues);

        // Create trace for the district
        const trace = {
            x: [pHMedian], // X-axis: mode of pH values for the district
            y: [gwlMedian], // Y-axis: mode of Gwl values for the district
            mode: 'markers',
            marker: {
                size: NaMedian,
                color: getRandomColor()
            },
            type: 'scatter',
            name: district // Set district name as trace name
        };

        // Store color for the district
        villageColors[district] = trace.marker.color;

        traces.push(trace);
    });

    return { traces, villageColors };
}

function createBubbleChart(districtData, districtName) {
    const traces = [];
    const villageColors = {}; // Store colors for each village

    // Loop through each village in the district
    districtData.forEach((villageData, index) => {
        const gwlData = parseFloat(villageData.gwl);
        const phData = parseFloat(villageData.pH);
        const NaData = parseFloat(villageData.Na);

        // Assign a unique color to each village
        const color = getRandomColor();
        villageColors[villageData.village] = color;

        // Create trace for the current village
        const trace = {
            x: [phData], // X-axis: pH value for the village
            y: [gwlData], // Y-axis: Gwl value for the village
            mode: 'markers',
            marker: {
                size: NaData,
                color: color
            },
            type: 'scatter',
            name: villageData.village, // Set village name as trace name
            text: [villageData.village], // Set village name as hover text
            hoverinfo: 'text+x+y' // Show village name, pH, and Gwl as hover text
        };

        traces.push(trace);
    });

    // Create layout for the bubble chart
    const layout = {
        title: `Bubble Chart for ${districtName}`,
        xaxis: {
            title: 'pH'
        },
        yaxis: {
            title: 'gwl'
        },
        legend: {
            traceorder: 'normal'
        }
    };

    // Create a new div for the bubble chart
    const chartDiv = document.createElement('div');
    const chartId = `bubbleChart-${districtName.replace(/\s+/g, '-')}`;
    chartDiv.id = chartId;
    document.getElementById('bubbleChartsContainer').appendChild(chartDiv);

    // Plot the bubble chart inside the div
    Plotly.newPlot(chartId, traces, layout);

    return villageColors;
}

function parseCSV(csvData) {
    const parsedData = Papa.parse(csvData, { header: true });
    const bubbleChartsContainer = document.getElementById('bubbleChartsContainer');

    // Remove outliers
    parsedData.data = parsedData.data.filter(row => {
        // Adjust these conditions according to your outlier removal criteria
        return parseFloat(row.gwl) > 0 && parseFloat(row.gwl) < 100 &&
            parseFloat(row.pH) > 0 && parseFloat(row.pH) < 14;
    });

    // Create combined bubble chart for all districts
    const { traces, villageColors } = createCombinedBubbleChart(parsedData);

    // Create layout for the combined bubble chart
    const layout = {
        title: `Combined Bubble Chart for All Districts`,
        xaxis: {
            title: 'pH'
        },
        yaxis: {
            title: 'gwl'
        },
        legend: {
            traceorder: 'normal'
        }
    };

    // Create a new div for the combined bubble chart
    const chartDiv = document.createElement('div');
    const chartId = `combinedBubbleChart`;
    chartDiv.id = chartId;
    document.getElementById('combinedBubbleChartContainer').appendChild(chartDiv);

    // Plot the combined bubble chart inside the div
    Plotly.newPlot(chartId, traces, layout);

    // Set district colors as legend
    const legendEntries = [];
    Object.keys(villageColors).forEach(district => {
        const color = villageColors[district];
        legendEntries.push({
            showlegend: true,
            legendgroup: district,
            name: district,
            marker: { color: color }
        });
    });
    Plotly.restyle(chartId, legendEntries);

    // Create bubble chart for each district
    Object.keys(parsedData.data).forEach(index => {
        const districtName = parsedData.data[index].district;
        const districtData = parsedData.data.filter(row => row.district === districtName);
        createBubbleChart(districtData, districtName);
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function calculateMedian(arr) {
    const sortedArr = arr.sort((a, b) => a - b);
    const mid = Math.floor(sortedArr.length / 2);
    if (sortedArr.length % 2 === 0) {
        return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
    } else {
        return sortedArr[mid];
    }
}

