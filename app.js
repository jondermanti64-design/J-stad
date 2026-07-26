document.getElementById('resetBtn').addEventListener('click', () => {
    document.querySelectorAll('input[type="number"]').forEach(input => input.value = '1.0');
    document.getElementById('resultsSection').style.display = 'none';
});

// Aseguramos que detecte el botón de cálculo sin importar el nombre exacto
const calcButton = document.getElementById('calculateBtn') || document.querySelector('.btn-primary');

if (calcButton) {
    calcButton.addEventListener('click', function() {
        // Capturar Hechos y Recibidos del Local
        const hGF = parseFloat(document.getElementById('h_gH').value) || 0;
        const hGA = parseFloat(document.getElementById('h_gR').value) || 0;
        const hRH = parseFloat(document.getElementById('h_rH').value) || 0;
        const hRR = parseFloat(document.getElementById('h_rR').value) || 0;
        const hPH = parseFloat(document.getElementById('h_pH').value) || 0;
        const hPR = parseFloat(document.getElementById('h_pR').value) || 0;
        const hCH = parseFloat(document.getElementById('h_cH').value) || 0;
        const hCR = parseFloat(document.getElementById('h_cR').value) || 0;

        // Capturar Hechos y Recibidos del Visitante
        const aGF = parseFloat(document.getElementById('a_gH').value) || 0;
        const aGA = parseFloat(document.getElementById('a_gR').value) || 0;
        const aRH = parseFloat(document.getElementById('a_rH').value) || 0;
        const aRR = parseFloat(document.getElementById('a_rR').value) || 0;
        const aPH = parseFloat(document.getElementById('a_pH').value) || 0;
        const aPR = parseFloat(document.getElementById('a_pR').value) || 0;
        const aCH = parseFloat(document.getElementById('a_cH').value) || 0;
        const aCR = parseFloat(document.getElementById('a_cR').value) || 0;

        // Cálculo cruzado de goles (Lambda)
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

        // Expectativas para remates, remates a puerta y corners
        const homeShotsExp = (hRH + aRR) / 2;
        const awayShotsExp = (aRH + hRR) / 2;
        const homeOnTargetExp = (hPH + aPR) / 2;
        const awayOnTargetExp = (aPH + hPR) / 2;
        const homeCornersExp = (hCH + aCR) / 2;
        const awayCornersExp = (aCH + hCR) / 2;

        const totalShotsExp = homeShotsExp + awayShotsExp;
        const totalOnTargetExp = homeOnTargetExp + awayOnTargetExp;
        const totalCornersExp = homeCornersExp + awayCornersExp;

        function poissonOverProb(lambda, threshold) {
            let cumulative = 0;
            for (let k = 0; k <= threshold; k++) {
                cumulative += poisson(lambda, k);
            }
            return Math.max(5, Math.min(95, (1 - cumulative) * 100));
        }

        const homeShotsThresh = Math.floor(homeShotsExp - 0.5);
        const awayShotsThresh = Math.floor(awayShotsExp - 0.5);
        const homeOnTargetThresh = Math.floor(homeOnTargetExp - 0.5);
        const awayOnTargetThresh = Math.floor(awayOnTargetExp - 0.5);
        const homeCornersThresh = Math.floor(homeCornersExp - 0.5);
        const awayCornersThresh = Math.floor(awayCornersExp - 0.5);

        const pHShots = poissonOverProb(homeShotsExp, homeShotsThresh);
        const pAShots = poissonOverProb(awayShotsExp, awayShotsThresh);
        const pHOnTarget = poissonOverProb(homeOnTargetExp, homeOnTargetThresh);
        const pAOnTarget = poissonOverProb(awayOnTargetExp, awayOnTargetThresh);
        const pHCorners = poissonOverProb(homeCornersExp, homeCornersThresh);
        const pACorners = poissonOverProb(awayCornersExp, awayCornersThresh);

        const totalShotsThresh = Math.floor(totalShotsExp - 0.5);
        const totalOnTargetThresh = Math.floor(totalOnTargetExp - 0.5);
        const totalCornersThresh = Math.floor(totalCornersExp - 0.5);

        const pTotalShots = poissonOverProb(totalShotsExp, totalShotsThresh);
        const pTotalOnTarget = poissonOverProb(totalOnTargetExp, totalOnTargetThresh);
        const pTotalCorners = poissonOverProb(totalCornersExp, totalCornersThresh);

        document.getElementById('individualStatsContainer').innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.4); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #38bdf8;">
                <h4 style="color: #38bdf8; margin-bottom: 6px;">🏠 Equipo Local</h4>
                <div style="margin: 4px 0;">• Remates: <strong>${homeShotsExp.toFixed(1)}</strong> (Más de ${homeShotsThresh}.5: <strong>${pHShots.toFixed(1)}%</strong>)</div>
                <div style="margin: 4px 0;">• Remates a Puerta: <strong>${homeOnTargetExp.toFixed(1)}</strong> (Más de ${homeOnTargetThresh}.5: <strong>${pHOnTarget.toFixed(1)}%</strong>)</div>
                <div style="margin: 4px 0;">• Tiros de Esquina: <strong>${homeCornersExp.toFixed(1)}</strong> (Más de ${homeCornersThresh}.5: <strong>${pHCorners.toFixed(1)}%</strong>)</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.4); padding: 12px; border-radius: 8px; border-left: 4px solid #f43f5e;">
                <h4 style="color: #f43f5e; margin-bottom: 6px;">✈️ Equipo Visitante</h4>
                <div style="margin: 4px 0;">• Remates: <strong>${awayShotsExp.toFixed(1)}</strong> (Más de ${awayShotsThresh}.5: <strong>${pAShots.toFixed(1)}%</strong>)</div>
                <div style="margin: 4px 0;">• Remates a Puerta: <strong>${awayOnTargetExp.toFixed(1)}</strong> (Más de ${awayOnTargetThresh}.5: <strong>${pAOnTarget.toFixed(1)}%</strong>)</div>
                <div style="margin: 4px 0;">• Tiros de Esquina: <strong>${awayCornersExp.toFixed(1)}</strong> (Más de ${awayCornersThresh}.5: <strong>${pACorners.toFixed(1)}%</strong>)</div>
            </div>
        `;

        document.getElementById('expTotalShots').innerHTML = `${totalShotsExp.toFixed(1)} <span style="font-size:0.85rem; color:#38bdf8;">(Más de ${totalShotsThresh}.5: ${pTotalShots.toFixed(1)}%)</span>`;
        document.getElementById('expTotalOnTarget').innerHTML = `${totalOnTargetExp.toFixed(1)} <span style="font-size:0.85rem; color:#38bdf8;">(Más de ${totalOnTargetThresh}.5: ${pTotalOnTarget.toFixed(1)}%)</span>`;
        document.getElementById('expTotalCorners').innerHTML = `${totalCornersExp.toFixed(1)} <span style="font-size:0.85rem; color:#38bdf8;">(Más de ${totalCornersThresh}.5: ${pTotalCorners.toFixed(1)}%)</span>`;

        let recsHtml = `
            <div class="rec-item">🎯 <strong>Remates Local:</strong> Más de ${homeShotsThresh}.5 (${pHShots.toFixed(1)}%)</div>
            <div class="rec-item">🎯 <strong>Remates Visitante:</strong> Más de ${awayShotsThresh}.5 (${pAShots.toFixed(1)}%)</div>
            <div class="rec-item">⚡ <strong>A Puerta Local:</strong> Más de ${homeOnTargetThresh}.5 (${pHOnTarget.toFixed(1)}%)</div>
            <div class="rec-item">⚡ <strong>A Puerta Visitante:</strong> Más de ${awayOnTargetThresh}.5 (${pAOnTarget.toFixed(1)}%)</div>
            <div class="rec-item">📈 <strong>Total Partido:</strong> Más de ${totalShotsThresh}.5 Remates Conjuntos (${pTotalShots.toFixed(1)}%)</div>
        `;

        document.getElementById('recommendationsList').innerHTML = recsHtml;
        document.getElementById('resultsSection').style.display = 'block';
    });
}
