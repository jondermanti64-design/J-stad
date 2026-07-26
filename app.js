function generateMatchInputs(containerId, prefix) {
    const container = document.getElementById(containerId);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `
            <div class="match-row">
                <div class="match-title">Partido ${i}</div>
                <div class="inputs-mini">
                    <div class="input-mini-group">
                        <label>G. Hecho</label>
                        <input type="number" id="${prefix}_gH_${i}" value="1" min="0">
                    </div>
                    <div class="input-mini-group">
                        <label>G. Recib</label>
                        <input type="number" id="${prefix}_gR_${i}" value="1" min="0">
                    </div>
                    <div class="input-mini-group">
                        <label>Rem. Hecho</label>
                        <input type="number" id="${prefix}_rH_${i}" value="12" min="0">
                    </div>
                    <div class="input-mini-group">
                        <label>Rem. Recib</label>
                        <input type="number" id="${prefix}_rR_${i}" value="10" min="0">
                    </div>
                </div>
                <div class="inputs-mini" style="margin-top: 4px;">
                    <div class="input-mini-group">
                        <label>Puer. Hecho</label>
                        <input type="number" id="${prefix}_pH_${i}" value="4" min="0">
                    </div>
                    <div class="input-mini-group">
                        <label>Puer. Recib</label>
                        <input type="number" id="${prefix}_pR_${i}" value="3" min="0">
                    </div>
                    <div class="input-mini-group">
                        <label>Corn. Hecho</label>
                        <input type="number" id="${prefix}_cH_${i}" value="5" min="0">
                    </div>
                    <div class="input-mini-group">
                        <label>Corn. Recib</label>
                        <input type="number" id="${prefix}_cR_${i}" value="4" min="0">
                    </div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', () => {
    generateMatchInputs('homeMatchesContainer', 'home');
    generateMatchInputs('awayMatchesContainer', 'away');
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.querySelectorAll('input[type="number"]').forEach(input => input.value = '1');
    document.getElementById('resultsSection').style.display = 'none';
});

document.getElementById('calculateBtn').addEventListener('click', function() {
    let sumHomeGH = 0, sumHomeGR = 0, sumHomeRH = 0, sumHomeRR = 0, sumHomePH = 0, sumHomePR = 0, sumHomeCH = 0, sumHomeCR = 0;
    let sumAwayGH = 0, sumAwayGR = 0, sumAwayRH = 0, sumAwayRR = 0, sumAwayPH = 0, sumAwayPR = 0, sumAwayCH = 0, sumAwayCR = 0;

    for (let i = 1; i <= 5; i++) {
        sumHomeGH += parseFloat(document.getElementById(`home_gH_${i}`).value) || 0;
        sumHomeGR += parseFloat(document.getElementById(`home_gR_${i}`).value) || 0;
        sumHomeRH += parseFloat(document.getElementById(`home_rH_${i}`).value) || 0;
        sumHomeRR += parseFloat(document.getElementById(`home_rR_${i}`).value) || 0;
        sumHomePH += parseFloat(document.getElementById(`home_pH_${i}`).value) || 0;
        sumHomePR += parseFloat(document.getElementById(`home_pR_${i}`).value) || 0;
        sumHomeCH += parseFloat(document.getElementById(`home_cH_${i}`).value) || 0;
        sumHomeCR += parseFloat(document.getElementById(`home_cR_${i}`).value) || 0;

        sumAwayGH += parseFloat(document.getElementById(`away_gH_${i}`).value) || 0;
        sumAwayGR += parseFloat(document.getElementById(`away_gR_${i}`).value) || 0;
        sumAwayRH += parseFloat(document.getElementById(`away_rH_${i}`).value) || 0;
        sumAwayRR += parseFloat(document.getElementById(`away_rR_${i}`).value) || 0;
        sumAwayPH += parseFloat(document.getElementById(`away_pH_${i}`).value) || 0;
        sumAwayPR += parseFloat(document.getElementById(`away_pR_${i}`).value) || 0;
        sumAwayCH += parseFloat(document.getElementById(`away_cH_${i}`).value) || 0;
        sumAwayCR += parseFloat(document.getElementById(`away_cR_${i}`).value) || 0;
    }

    const hGF = sumHomeGH / 5;
    const hGA = sumHomeGR / 5;
    const aGF = sumAwayGH / 5;
    const aGA = sumAwayGR / 5;

    const lambdaHome = (hGF + aGA) / 2;
    const lambdaAway = (aGF + hGA) / 2;

    document.getElementById('lambdaHomeVal').innerText = lambdaHome.toFixed(2);
    document.getElementById('lambdaAwayVal').innerText = lambdaAway.toFixed(2);

    function poisson(lambda, k) {
        return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
    }
    function factorial(n) {
        if (n === 0 || n === 1) return 1;
        let accum = 1;
        for (let i = 2; i <= n; i++) accum *= i;
        return accum;
    }

    let homeWin = 0, draw = 0, awayWin = 0, bttsYes = 0, over25 = 0;
    let scoreProbs = [];
    const maxGoals = 6;

    for (let h = 0; h <= maxGoals; h++) {
        for (let a = 0; a <= maxGoals; a++) {
            const pHome = poisson(lambdaHome, h);
            const pAway = poisson(lambdaAway, a);
            const pMatch = pHome * pAway;

            if (h > a) homeWin += pMatch;
            else if (h === a) draw += pMatch;
            else awayWin += pMatch;

            if (h > 0 && a > 0) bttsYes += pMatch;
            if (h + a > 2.5) over25 += pMatch;

            scoreProbs.push({ h, a, prob: pMatch });
        }
    }

    document.getElementById('homeWinProb').innerText = (homeWin * 100).toFixed(1) + '%';
    document.getElementById('drawProb').innerText = (draw * 100).toFixed(1) + '%';
    document.getElementById('awayWinProb').innerText = (awayWin * 100).toFixed(1) + '%';
    document.getElementById('bttsYes').innerText = (bttsYes * 100).toFixed(1) + '%';
    document.getElementById('over25').innerText = (over25 * 100).toFixed(1) + '%';
    document.getElementById('under25').innerText = ((1 - over25) * 100).toFixed(1) + '%';

    scoreProbs.sort((x, y) => y.prob - x.prob);
    const topScoresList = document.getElementById('topScoresList');
    topScoresList.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        const item = scoreProbs[i];
        const li = document.createElement('li');
        li.innerHTML = `<span>Local ${item.h} - ${item.a} Visitante</span> <strong>${(item.prob * 100).toFixed(1)}%</strong>`;
        topScoresList.appendChild(li);
    }

    let homeZero = poisson(lambdaHome, 0) * 100;
    let awayZero = poisson(lambdaAway, 0) * 100;

    // Estadísticas individuales exactas cruzadas por equipo
    const homeShotsExp = (sumHomeRH/5 + sumAwayRR/5) / 2;
    const awayShotsExp = (sumAwayRH/5 + sumHomeRR/5) / 2;
    const homeOnTargetExp = (sumHomePH/5 + sumAwayPR/5) / 2;
    const awayOnTargetExp = (sumAwayPH/5 + sumHomePR/5) / 2;
    const homeCornersExp = (sumHomeCH/5 + sumAwayCR/5) / 2;
    const awayCornersExp = (sumAwayCH/5 + sumHomeCR/5) / 2;

    // Probabilidades individuales de remates y corners usando poisson independiente
    function poissonProbSum(lambda, threshold) {
        let cumulative = 0;
        for (let k = 0; k <= threshold; k++) {
            cumulative += poisson(lambda, k);
        }
        return (1 - cumulative) * 100; // Probabilidad de superar el umbral
    }

    const homeShotsProbOver = poissonProbSum(homeShotsExp, Math.floor(homeShotsExp));
    const awayShotsProbOver = poissonProbSum(awayShotsExp, Math.floor(awayShotsExp));
    const homeCornersProbOver = poissonProbSum(homeCornersExp, Math.floor(homeCornersExp));
    const awayCornersProbOver = poissonProbSum(awayCornersExp, Math.floor(awayCornersExp));

    // Desglose visual individual completo
    document.getElementById('individualStatsContainer').innerHTML = `
        <div class="individual-block" style="background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
            <h4 style="color: #38bdf8; margin-bottom: 6px;">🏠 EQUIPO LOCAL (Desglose Individual)</h4>
            <p>• Goles Esperados (Lambda): <strong>${lambdaHome.toFixed(2)}</strong></p>
            <p>• Prob. Marcar 0 Goles: <strong>${homeZero.toFixed(1)}%</strong> | Marcar 1+ Goles: <strong>${(100 - homeZero).toFixed(1)}%</strong></p>
            <p>• Remates Totales Esperados: <strong>${homeShotsExp.toFixed(1)}</strong> (Prob. Más de ${(Math.floor(homeShotsExp))}.5: <strong>${homeShotsProbOver.toFixed(1)}%</strong>)</p>
            <p>• Remates a Puerta Esperados: <strong>${homeOnTargetExp.toFixed(1)}</strong></p>
            <p>• Tiros de Esquina Esperados: <strong>${homeCornersExp.toFixed(1)}</strong> (Prob. Más de ${(Math.floor(homeCornersExp))}.5: <strong>${homeCornersProbOver.toFixed(1)}%</strong>)</p>
        </div>
        <div class="individual-block" style="background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 8px;">
            <h4 style="color: #38bdf8; margin-bottom: 6px;">✈️ EQUIPO VISITANTE (Desglose Individual)</h4>
            <p>• Goles Esperados (Lambda): <strong>${lambdaAway.toFixed(2)}</strong></p>
            <p>• Prob. Marcar 0 Goles: <strong>${awayZero.toFixed(1)}%</strong> | Marcar 1+ Goles: <strong>${(100 - awayZero).toFixed(1)}%</strong></p>
            <p>• Remates Totales Esperados: <strong>${awayShotsExp.toFixed(1)}</strong> (Prob. Más de ${(Math.floor(awayShotsExp))}.5: <strong>${awayShotsProbOver.toFixed(1)}%</strong>)</p>
            <p>• Remates a Puerta Esperados: <strong>${awayOnTargetExp.toFixed(1)}</strong></p>
            <p>• Tiros de Esquina Esperados: <strong>${awayCornersExp.toFixed(1)}</strong> (Prob. Más de ${(Math.floor(awayCornersExp))}.5: <strong>${awayCornersProbOver.toFixed(1)}%</strong>)</p>
        </div>
    `;

    document.getElementById('expTotalShots').innerText = (homeShotsExp + awayShotsExp).toFixed(1);
    document.getElementById('expTotalOnTarget').innerText = (homeOnTargetExp + awayOnTargetExp).toFixed(1);
    document.getElementById('expTotalCorners').innerText = (homeCornersExp + awayCornersExp).toFixed(1);

    // Apuestas de alta probabilidad específicas por equipo y globales
    let recsHtml = '';
    recsHtml += `<div class="rec-item">🎯 <strong>Local - Remates:</strong> Más de ${(Math.max(8, Math.floor(homeShotsExp - 1)))}.5 Remates del Local (Esp: ${homeShotsExp.toFixed(1)})</div>`;
    recsHtml += `<div class="rec-item">🎯 <strong>Visitante - Remates:</strong> Más de ${(Math.max(7, Math.floor(awayShotsExp - 1)))}.5 Remates del Visitante (Esp: ${awayShotsExp.toFixed(1)})</div>`;
    recsHtml += `<div class="rec-item">🚩 <strong>Local - Corners:</strong> Más de ${(Math.max(3, Math.floor(homeCornersExp - 0.5)))}.5 Tiros de Esquina Local (Esp: ${homeCornersExp.toFixed(1)})</div>`;
    recsHtml += `<div class="rec-item">🚩 <strong>Visitante - Corners:</strong> Más de ${(Math.max(2, Math.floor(awayCornersExp - 0.5)))}.5 Tiros de Esquina Visitante (Esp: ${awayCornersExp.toFixed(1)})</div>`;
    recsHtml += `<div class="rec-item">⚡ <strong>Remates a Puerta:</strong> Local Más de 2.5 (${homeOnTargetExp.toFixed(1)}) / Visitante Más de 1.5 (${awayOnTargetExp.toFixed(1)})</div>`;

    document.getElementById('recommendationsList').innerHTML = recsHtml;
    document.getElementById('resultsSection').style.display = 'block';
});
