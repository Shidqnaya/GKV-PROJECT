const MAPS = document.getElementById('mapsplot');
let currentData = null; // Variabel untuk menyimpan data yang sedang ditampilkan

function parseCSV(csvData) {
    const parsedData = Papa.parse(csvData, { header: true });

    // Extract latitude, longitude, Classification, RSC, and TDS data
    const validRows = parsedData.data.filter(row => {
        const latitude = parseFloat(row.lat_gis);
        return !isNaN(latitude) && latitude >= -90 && latitude <= 90; // Filter out invalid latitude
    });

    const latitudes = validRows.map(row => parseFloat(row.lat_gis));
    const longitudes = validRows.map(row => parseFloat(row.long_gis));
    const classifications = validRows.map(row => row.Classification);
    const rscValues = validRows.map(row => parseFloat(row['RSC meq / L']));
    const tdsValues = validRows.map(row => parseFloat(row.TDS));

    var text = [];
    for (var i = 0; i < validRows.length; i++) {
        text.push(`Classification: ${classifications[i]}<br>RSC meq / L: ${rscValues[i]}<br>TDS: ${tdsValues[i]}`);
    }

    const dataDefault = {
        type: 'scattermapbox',
        mode: 'markers',
        lat: latitudes,
        lon: longitudes,
        marker: {
            size: 10,
            color: 'blue', // Default color
            opacity: 0.8
        },
        hoverinfo: 'text',
        text: text
    };

    const layout = {
        mapbox: { 
            style: 'outdoors',
            zoom: 6.3,
            center: { lon: 80, lat: 17.8 } 
        },
        margin: { t: 0, b: 0 }
    };

    const config = {
        mapboxAccessToken: 'pk.eyJ1Ijoic2hpZHFuYXlhIiwiYSI6ImNsd2YzbGttYTFxeDMya28waTN1MGY1dnoifQ.QolX-WwtBkbWYRCeJVfw2Q',
        responsive: true
    };

    // Simpan data default saat file CSV diproses
    currentData = dataDefault;

    // Tampilkan plot dengan data default
    Plotly.newPlot(MAPS, [currentData], layout, config);

    // Buat tombol-tombol view
    createViewButtons(validRows, layout, config);
}

// Function untuk menghasilkan array warna berdasarkan TDS
function getTDSColors(tdsValues) {
    return tdsValues.map(value => {
        if (value < 1000) {
            return '#00FF00'; // Hijau
        } else if (value >= 1000 && value < 3000) {
            return '#0000FF'; // Biru
        } else if (value >= 3000 && value < 5000) {
            return '#FFFF00'; // Kuning
        } else if (value >= 5000 && value < 7000) {
            return '#FFA500'; // Oranye
        } else if (value >= 7000 && value < 10000) {
            return '#FF0000'; // Merah
        } else {
            return '#800080'; // Ungu
        }
    });
}

// Function untuk menghasilkan array warna berdasarkan RSC
function getRSCColors(rscValues) {
    return rscValues.map(value => {
        if (value < 1.25) {
            return '#006400'; // safe (Hijau Tua)
        } else if (value >= 1.25 && value <= 2.50) {
            return '#FFA500'; // Marginal (orange)
        } else {
            return '#FF0000'; // Unsuitable (red)
        }
    });
}

function showRSCLegend() {
    const legend = document.getElementById('rsclegend');
    legend.style.display = 'block';
    legend.innerHTML = `
        <h3>Legenda Klasifikasi Berdasarkan RSC</h3>
        <div class="rsc-classification"><span style="background-color: #006400;"></span>RSC < 1.25: Aman<br>Nilai RSC rendah dan cocok untuk irigasi.</div>
        <div class="rsc-classification"><span style="background-color: #FFA500;"></span>1.25 ≤ RSC ≤ 2.50: Marginal<br>Nilai RSC yang marginal memerlukan pertimbangan khusus untuk irigasi.</div>
        <div class="rsc-classification"><span style="background-color: #FF0000;"></span>RSC > 2.50: Tidak cocok<br>Nilai RSC tinggi dan tidak cocok untuk irigasi karena dapat mengurangi permeabilitas tanah.</div>
    `;
}

function showTDSLegend() {
    const legend = document.getElementById('tdslegend');
    legend.style.display = 'block';
    legend.innerHTML = `
        <h3>Legenda Klasifikasi Berdasarkan TDS</h3>
        <div class="tds-classification"><span style="background-color: #00FF00;"></span>TDS < 1000 mg/L: Sangat baik<br>Cocok untuk semua jenis peternakan dan unggas.</div>
        <div class="tds-classification"><span style="background-color: #0000FF;"></span>1000 ≤ TDS < 3000 mg/L: Sangat memuaskan<br>Cocok untuk semua jenis peternakan. Mungkin menyebabkan diare ringan sementara pada hewan yang tidak terbiasa.</div>
        <div class="tds-classification"><span style="background-color: #FFFF00;"></span>3000 ≤ TDS < 5000 mg/L: Memuaskan untuk peternakan, tidak cocok untuk unggas<br>Cocok untuk peternakan, tetapi dapat ditolak oleh hewan yang tidak terbiasa. Jika garam sulfat mendominasi, hewan mungkin menunjukkan diare sementara.</div>
        <div class="tds-classification"><span style="background-color: #FFA500;"></span>5000 ≤ TDS < 7000 mg/L: Penggunaan terbatas untuk peternakan, tidak cocok untuk unggas<br>Air ini dapat digunakan untuk peternakan kecuali untuk hewan yang sedang hamil atau menyusui. Mungkin memiliki efek pencahar dan bisa ditolak oleh hewan sampai mereka terbiasa.</div>
        <div class="tds-classification"><span style="background-color: #FF0000;"></span>7000 ≤ TDS < 10000 mg/L: Penggunaan sangat terbatas<br>Risiko besar untuk sapi, kuda, domba yang sedang hamil dan menyusui serta untuk anak hewan dari spesies ini. Mungkin digunakan untuk ternak dewasa atau kuda. Tidak cocok untuk unggas.</div>
        <div class="tds-classification"><span style="background-color: #800080;"></span>TDS ≥ 10000 mg/L: Tidak direkomendasikan<br>Air ini tidak cocok untuk semua jenis peternakan dan unggas.</div>
    `;
}


function showClassLegend() {
    const legend = document.getElementById('classlegend');
    legend.style.display = 'block';
    legend.innerHTML = `
        <h3>Legenda Klasifikasi</h3>
        <div class="classification"><span style="background-color: #FF0000;"></span>C1S1: Air dengan salinitas rendah dan natrium rendah baik untuk irigasi dan dapat digunakan dengan sebagian besar tanaman tanpa pembatasan pada sebagian besar jenis tanah.</div>
        <div class="classification"><span style="background-color: #00FF00;"></span>C2S1: Air dengan salinitas sedang dan natrium rendah baik untuk irigasi dan dapat digunakan pada hampir semua jenis tanah dengan sedikit risiko perkembangan kadar natrium pertukaran yang berbahaya jika dilakukan pencucian moderat. Tanaman dapat ditanam tanpa pertimbangan khusus untuk pengendalian salinitas.</div>
        <div class="classification"><span style="background-color: #0000FF;"></span>C3S1: Air dengan salinitas tinggi dan natrium rendah memerlukan drainase yang baik. Tanaman dengan toleransi garam yang baik harus dipilih.</div>
        <div class="classification"><span style="background-color: #FFFF00;"></span>C3S2: Air dengan salinitas tinggi dan natrium sedang memerlukan drainase yang baik dan dapat digunakan pada tanah bertekstur kasar atau tanah organik yang memiliki permeabilitas yang baik.</div>
        <div class="classification"><span style="background-color: #FFA500;"></span>C3S3: Air dengan salinitas tinggi dan natrium tinggi memerlukan manajemen tanah khusus, drainase yang baik, pencucian yang tinggi, dan penambahan bahan organik. Amandemen gypsum memungkinkan penggunaan air ini.</div>
        <div class="classification"><span style="background-color: #800080;"></span>C4S1: Air dengan salinitas sangat tinggi dan natrium rendah tidak cocok untuk irigasi kecuali tanah harus permeabel dan drainase harus memadai. Air irigasi harus diterapkan dalam jumlah berlebih untuk menyediakan pencucian yang cukup. Tanaman yang toleran terhadap garam harus dipilih.</div>
        <div class="classification"><span style="background-color: #00FFFF;"></span>C4S2: Air dengan salinitas sangat tinggi dan natrium sedang tidak cocok untuk irigasi pada tanah bertekstur halus dan kondisi pencucian rendah dan dapat digunakan untuk irigasi pada tanah bertekstur kasar atau tanah organik yang memiliki permeabilitas yang baik.</div>
        <div class="classification"><span style="background-color: #FF00FF;"></span>C4S3: Air dengan salinitas sangat tinggi dan natrium tinggi menghasilkan kadar natrium pertukaran yang berbahaya di sebagian besar tanah dan memerlukan manajemen tanah khusus, drainase yang baik, pencucian yang tinggi, dan penambahan bahan organik. Amandemen gypsum memungkinkan penggunaan air ini.</div>
        <div class="classification"><span style="background-color: #000000;"></span>C4S4: Air dengan salinitas sangat tinggi dan natrium sangat tinggi umumnya tidak cocok untuk tujuan irigasi. Ini adalah jenis air natrium klorida dan dapat menyebabkan bahaya natrium. Dapat digunakan pada tanah bertekstur kasar dengan drainase yang sangat baik untuk tanaman yang sangat toleran terhadap garam. Amandemen gypsum memungkinkan penggunaan air ini.</div>
    `;
}

function getClassificationColors(classifications) {
    return classifications.map(classification => {
        switch(classification) {
            case 'C1S1':
                return '#FF0000'; // Merah
            case 'C2S1':
                return '#00FF00'; // Hijau
            case 'C3S1':
                return '#0000FF'; // Biru
            case 'C3S2':
                return '#FFFF00'; // Kuning
            case 'C3S3':
                return '#FFA500'; // Oranye
            case 'C4S1':
                return '#800080'; // Ungu
            case 'C4S2':
                return '#00FFFF'; // Cyan
            case 'C4S3':
                return '#FF00FF'; // Magenta
            case 'C4S4':
                return '#000000'; // Hitam
            default:
                return 'blue'; // Default
        }
    });
}



function createViewButtons(rows, layout, config) {
    const viewButtons = document.getElementById('viewButtons');
    viewButtons.innerHTML = ''; // Kosongkan elemen viewButtons sebelumnya

    // Button Default View
    const defaultBtn = document.createElement('button');
    defaultBtn.textContent = 'Default View';
    defaultBtn.addEventListener('click', function() {
        Plotly.newPlot(MAPS, [currentData], layout, config);
        document.getElementById('classlegend').style.display = 'none';
        document.getElementById('rsclegend').style.display = 'none';
        document.getElementById('tdslegend').style.display = 'none';
    });
    viewButtons.appendChild(defaultBtn);

    // Button View Classification
    const classificationBtn = document.createElement('button');
    classificationBtn.textContent = 'View Classification';
    classificationBtn.addEventListener('click', function() {
        const data = {
            type: 'scattermapbox',
            mode: 'markers',
            lat: rows.map(row => parseFloat(row.lat_gis)),
            lon: rows.map(row => parseFloat(row.long_gis)),
            marker: {
                size: 10,
                color: getClassificationColors(rows.map(row => row.Classification)),
                opacity: 0.8
            },
            hoverinfo: 'text',
            text: rows.map(row => `Classification: ${row.Classification}<br>RSC meq / L: ${row['RSC meq / L']}<br>TDS: ${row.TDS}`)
        };
        Plotly.newPlot(MAPS, [data], layout, config);
        document.getElementById('rsclegend').style.display = 'none';
        document.getElementById('tdslegend').style.display = 'none';
        showClassLegend(); // Tampilkan legenda saat View Classification ditekan
    });
    viewButtons.appendChild(classificationBtn);

    // Button View RSC
    const rscBtn = document.createElement('button');
    rscBtn.textContent = 'View RSC';
    rscBtn.addEventListener('click', function() {
        const data = {
            type: 'scattermapbox',
            mode: 'markers',
            lat: rows.map(row => parseFloat(row.lat_gis)),
            lon: rows.map(row => parseFloat(row.long_gis)),
            marker: {
                size: 10,
                color: getRSCColors(rows.map(row => parseFloat(row['RSC meq / L']))),
                opacity: 0.8
            },
            hoverinfo: 'text',
            text: rows.map(row => `Classification: ${row.Classification}<br>RSC meq / L: ${row['RSC meq / L']}<br>TDS: ${row.TDS}`)
        };
        Plotly.newPlot(MAPS, [data], layout, config);
        document.getElementById('classlegend').style.display = 'none';
        document.getElementById('tdslegend').style.display = 'none';
        showRSCLegend(); // Tampilkan legenda saat View RSC ditekan
    });
    viewButtons.appendChild(rscBtn);

    // Button View TDS
    const tdsBtn = document.createElement('button');
    tdsBtn.textContent = 'View TDS';
    tdsBtn.addEventListener('click', function() {
        const data = {
            type: 'scattermapbox',
            mode: 'markers',
            lat: rows.map(row => parseFloat(row.lat_gis)),
            lon: rows.map(row => parseFloat(row.long_gis)),
            marker: {
                size: 10,
                color: getTDSColors(rows.map(row => parseFloat(row.TDS))),
                opacity: 0.8
            },
            hoverinfo: 'text',
            text: rows.map(row => `Classification: ${row.Classification}<br>RSC meq / L: ${row['RSC meq / L']}<br>TDS: ${row.TDS}`)
        };
        Plotly.newPlot(MAPS, [data], layout, config);
        document.getElementById('classlegend').style.display = 'none';
        document.getElementById('rsclegend').style.display = 'none';
        showTDSLegend(); // Tampilkan legenda saat View TDS ditekan
    });
    viewButtons.appendChild(tdsBtn);
}
