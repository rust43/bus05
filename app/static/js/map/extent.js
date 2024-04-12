// -----------------
// Extent definition
// -----------------

const style = new Style({
    fill: new FillStyle({
        color: 'rgba(255, 255, 255, 0.6)',
    }), stroke: new StrokeStyle({
        color: '#3399cc', width: 2,
    }),
});

// extent interaction
const extent = new ExtentInteraction({condition: ShiftKeyOnly, boxStyle: style});
map.addInteraction(extent);