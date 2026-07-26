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

    const homeShotsExp = (sumHomeRH/5 + sumAwayRR/5) / 2;
    const awayShotsExp = (sumAwayRH/5 + sumHomeRR/5) / 2;
    const homeOnTargetExp = (sumHomePH/5 + sumAwayPR/5) / 2;
    const awayOnTargetExp = (sumAwayPH/5 + sumHomePR/5) / 2;
    const homeCornersExp = (sumHomeCH/5 + sumAwayCR/5) / 2;
    const awayCornersExp = (sumAwayCH/5 + sumHomeCR/5) / 2;

    document.getElementById('individualStatsContainer').innerHTML = `
        <div class="individual-block">
            <h4>🏠 Local: Goles Esp. ${lambdaHome.toFixed(2)}</h4>
            <p>• Prob. marcar 0: ${homeZero.toFixed(1)}% | Marcar 1+: ${(100 - homeZero).toFixed(1)}%</p>
            <p style="margin-top: 4px; color: #38bdf8;">• Remates Esp: <strong>${homeShotsExp.toFixed(1)}</strong> | A Puerta: <strong>${homeOnTargetExp.toFixed(1)}</strong> | Corners: <strong>${homeCornersExp.toFixed(1)}</strong></p>
        </div>
        <div class="individual-block" style="margin-top: 10px; border-top: 1px solid #334155; padding-top: 8px;">
            <h4>✈️ Visitante: Goles Esp. ${lambdaAway.toFixed(2)}</h4>
            <p>• Prob. marcar 0: ${awayZero.toFixed(1)}% | Marcar 1+: ${(100 - awayZero).toFixed(1)}%</p>
            <p style="margin-top: 4px; color: #38bdf8;">• Remates Esp: <strong>${awayShotsExp.toFixed(1)}</strong> | A Puerta: <strong>${awayOnTargetExp.toFixed(1)}</strong> | Corners: <strong>${awayCornersExp.toFixed(1)}</strong></p>
        </div>
    `;

    document.getElementById('expTotalShots').innerText = (homeShotsExp + awayShotsExp).toFixed(1);
    document.getElementById('expTotalOnTarget').innerText = (homeOnTargetExp + awayOnTargetExp).toFixed(1);
    document.getElementById('expTotalCorners').innerText = (homeCornersExp + awayCornersExp).toFixed(1);

    // Generador inteligente de Apuestas por Equipo Separado y Alta Probabilidad
    let recsHtml = '';
    
    // 1. Apuesta Local
    if (homeShotsExp >= 11.5) {
        recsHtml += `<div class="rec-item">🎯 <strong>Equipo Local - Remates:</strong> Más de ${(Math.floor(homeShotsExp - 1))}.5 Remates (Esperados: ${homeShotsExp.toFixed(1)})</div>`;
    } else {
        recsHtml += `<div class="rec-item">🎯 <strong>Equipo Local - Goles:</strong> Local Anota (Más de 0.5 goles) - Prob: ${(100 - homeZero).toFixed(1)}%</div>`;
    }

    // 2. Apuesta Visitante
    if (awayShotsExp >= 10.5) {
        recsHtml += `<div class="rec-item">🎯 <strong>Equipo Visitante - Remates:</strong> Más de ${(Math.floor(awayShotsExp - 1))}.5 Remates (Esperados: ${awayShotsExp.toFixed(1)})</div>`;
    } else {
        recsHtml += `<div class="rec-item">🛡️ <strong>Equipo Visitante - Oportunidad:</strong> Doble Oportunidad Visitante (X2) o Gol Visitante.</div>`;
    }

    // 3. Tiros de Esquina Individuales (Corners)
    if (homeCornersExp >= 4.2) {
        recsHtml += `<div class="rec-item">🚩 <strong>Corners Local:</strong> Más de ${(Math.floor(homeCornersExp - 0.5))}.5 Tiros de Esquina del Local (Esp: ${homeCornersExp.toFixed(1)})</div>`;
    }
    if (awayCornersExp >= 3.8) {
        recsHtml += `<div class="rec-item">🚩 <strong>Corners Visitante:</strong> Más de ${(Math.floor(awayCornersExp - 0.5))}.5 Tiros de Esquina del Visitante (Esp: ${awayCornersExp.toFixed(1)})</div>`;
    }

    // 4. Remates a Puerta Individuales
    if (homeOnTargetExp >= 3.8) {
        recsHtml += `<div class="rec-item">⚡ <strong>Remates a Puerta Local:</strong> Más de 3.5 Remates a Puerta del Local (Esp: ${homeOnTargetExp.toFixed(1)})</div>`;
    } else if (awayOnTargetExp >= 3.2) {
        recsHtml += `<div class="rec-item">⚡ <strong>Remates a Puerta Visitante:</strong> Más de 2.5 Remates a Puerta del Visitante (Esp: ${awayOnTargetExp.toFixed(1)})</div>`;
    }

    // 5. Mercado general fuerte
    if (over25 > 0.52) {
        recsHtml += `<div class="rec-item">📈 <strong>Mercado Global:</strong> Más de 2.5 Goles en el partido (${(over25*100).toFixed(1)}%)</div>`;
    } else {
        recsHtml += `<div class="rec-item">🔒 <strong>Mercado Global:</strong> Menos de 3.5 Goles totales (Control defensivo).</div>`;
    }

    document.getElementById('recommendationsList').innerHTML = recsHtml;
    document.getElementById('resultsSection').style.display = 'block';
});
