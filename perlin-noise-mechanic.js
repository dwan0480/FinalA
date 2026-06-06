function getPerlinColourAmount(can){

    return noise(
        can.seed + 999,
        frameCount * 0.003
    );

}

function getPerlinHue(can){

    const n = getPerlinColourAmount(can);

    // 深红 -> 红 -> 橙 -> 金黄

    if(n < 0.25){

        return map(
            n,
            0,
            0.25,
            350,
            360
        );

    }

    if(n < 0.6){

        return map(
            n,
            0.25,
            0.6,
            0,
            18
        );

    }

    return map(
        n,
        0.6,
        1,
        18,
        45
    );

}

function getPerlinBrightness(can){

    return map(
        getPerlinColourAmount(can),
        0,
        1,
        55,
        100
    );

}

function getPerlinLabelHue(can){

    return getPerlinHue(can);

}

function getPerlinLabelBrightness(can){

    return 100;

}