import React, { useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

export default function App({ query }: { query: { [key: string]: string } }) {
  const file = query.file || "tracks";
  const tracks = require(`../${file}.json`);

  useEffect(() => {
    let chart = am4core.create("graph-container", am4charts.XYChart);
    chart.data = tracks;
    chart.cursor = new am4charts.XYCursor();

    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "name";
    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());

    let energy = chart.series.push(new am4charts.LineSeries());
    energy.dataFields.valueX = "energy";
    energy.dataFields.categoryY = "name";
    energy.tooltipText = "Energy: {valueX}";

    let valence = chart.series.push(new am4charts.LineSeries());
    valence.dataFields.valueX = "valence";
    valence.dataFields.categoryY = "name";
    valence.tooltipText = "Valence: {valueX}";

    let danceability = chart.series.push(new am4charts.LineSeries());
    danceability.dataFields.valueX = "danceability";
    danceability.dataFields.categoryY = "name";
    danceability.tooltipText = "danceability: {valueX}";

    let speechiness = chart.series.push(new am4charts.LineSeries());
    speechiness.dataFields.valueX = "speechiness";
    speechiness.dataFields.categoryY = "name";
    speechiness.tooltipText = "speechiness: {valueX}";

    let acousticness = chart.series.push(new am4charts.LineSeries());
    acousticness.dataFields.valueX = "acousticness";
    acousticness.dataFields.categoryY = "name";
    acousticness.tooltipText = "acousticness: {valueX}";

    // let instrumentalness = chart.series.push(new am4charts.LineSeries());
    // instrumentalness.dataFields.valueX = "instrumentalness";
    // instrumentalness.dataFields.categoryY = "name";
    // instrumentalness.tooltipText = "instrumentalness: {valueX}";

    // tempo and loudness on a different scale
    // let loudness = chart.series.push(new am4charts.LineSeries());
    // loudness.dataFields.valueX = "loudness";
    // loudness.dataFields.categoryY = "name";
    // loudness.tooltipText = "loudness: {valueX}";

    // let tempo = chart.series.push(new am4charts.LineSeries());
    // tempo.dataFields.valueX = "tempo";
    // tempo.dataFields.categoryY = "name";
    // tempo.tooltipText = "tempo: {valueX}";

    return () => {
      chart.dispose();
    };
  }, []);
  return (
    <div>
      <div id="graph-container" style={{ width: "100vw", height: "100vh" }} />
      <div>
        {tracks.map((t: any) => (
          <div>{t.name}</div>
        ))}
      </div>
    </div>
  );
}

App.getInitialProps = ({ query }: { query: { [key: string]: string } }) => ({
  query
});

/*
   { danceability: 0.601,
     energy: 0.31,
     key: 2,
     loudness: -13.843,
     mode: 0,
     speechiness: 0.0354,
     acousticness: 0.889,
     instrumentalness: 0.911,
     liveness: 0.115,
     valence: 0.156,
     tempo: 76.889,
*/
