import React, { useEffect, useState } from "react";
import Papa from 'papaparse';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function getSimilarColor(inputColor,i,dataLen) {
    const factor = dataLen/0.2
    inputColor = inputColor.slice(1);
  
    // Convert the hex color to RGB values
    const r = parseInt(inputColor.slice(0, 2), 16);
    const g = parseInt(inputColor.slice(2, 4), 16);
    const b = parseInt(inputColor.slice(4, 6), 16);
  
    const newR = Math.abs((r + factor * 0.7 * i) % 256);
    const newG = Math.abs((g + factor * 0.5 * i) % 256);
    const newB = Math.abs((b + factor * 2 * i) % 256);
  
    // Convert the new RGB values back to hex
    const newColor = `#${(1 << 24 | newR << 16 | newG << 8 | newB).toString(16).slice(1)}`;
    return newColor;
  }

export default function BarPlot(dataPath) {
    // const [rawData, setRawData] = useState([])
    const [data,setData] = useState([])
    const path = dataPath.data
    const title = dataPath.title
    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: title,
            fullSize: true,
          },
        },
    };
    
    async function getData(path) {
        let rawData = Papa.parse(await fetchCsv(path));
        rawData = rawData.data
        //  Split label and data
        let labels = []
        let cols = []
        let groupData = []
        
        cols = rawData[0].slice(1)
        for (let i = 1; i < rawData[0].length; i++) {
            const tempGroup = []
            for (let j = 1; j < rawData.length; j++) {
                if (i == 1) {
                    labels.push(rawData[j][0])
                }
                tempGroup.push(rawData[j][i])
            }
            groupData.push(tempGroup)
        }
        // console.log("cols", cols)
        // console.log("groupData", groupData)
        // console.log("labels", labels)

        const data = {
            labels,
            datasets: cols.map((val,i) => {
                return {
                    label: cols[i],
                    data: groupData[i],
                    // borderColor: "FFE500",
                    backgroundColor: getSimilarColor("#B79D6B",i,cols.length),
                    yAxisID: "y",
                }
            })
        };      
        setData(data)   
    }
    
    async function fetchCsv(path) {
        const response = await fetch(path);
        const reader = response.body.getReader();
        const result = await reader.read();
        const decoder = new TextDecoder('utf-8');
        const csv = await decoder.decode(result.value);
        return csv;
    }    
    useEffect(() => {
        getData(path)
    }, [])
    
    return (
        data.length == 0 ? <div></div> : <Bar options={options} data={data}/> 
    )
}