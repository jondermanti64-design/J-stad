document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsSection = document.getElementById('resultsSection');

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('input[type="number"]').forEach(input => input.value = '1.0');
            if (resultsSection) resultsSection.style.display = 'none';
        });
    }

    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const hGF = parseFloat(document.getElementById('h_gH').value) || 0;
            const hGA = parseFloat(document.getElementById('h_gR').value) || 0;
            const hRH = parseFloat(document.getElementById('h_rH').value) || 0;
            const hRR = parseFloat(document.getElementById('h_rR').value) || 0;
            const hPH = parseFloat(document.getElementById('h_pH').value) || 0;
            const hPR = parseFloat(document.getElementById('h_pR').value) || 0;
            const hCH = parseFloat(document.getElementById('h_cH').value) || 0;
            const hCR = parseFloat(document.getElementById('h_cR').value) || 0;

            const aGF = parseFloat(document.getElementById('a_gH').value) || 0;
            const aGA = parseFloat(document.getElementById('a_gR').value) || 0;
            const aRH = parseFloat(document.getElementById('a_rH').value) || 0;
            const aRR = parseFloat(document.getElementById('a_rR').value) || 0;
            const aPH = parseFloat(document.getElementById('a_pH').value) || 0;
            const aPR = parseFloat(document.getElementById('a_pR').value) || 0;
            const aCH = parseFloat(document.getElementById('a_cH').value) || 0;
            const aCR = parseFloat(document.getElementById('a_cR').value) || 0;

            const lambdaHome = (hGF + aGA) / 2;
            const lambdaAway = (aGF + hGA) / 2;
            const totalGoalsExp = lambdaHome + lambdaAway;

            const homeShotsExp = (hRH + aRR) / 2;
            const awayShotsExp = (aRH + hRR) / 2;
            const totalShotsExp = homeShotsExp + awayShotsExp;

            const homeOnTargetExp = (hPH + aPR) / 2;
            const awayOnTargetExp = (aPH + hPR) / 2;
            const totalOnTargetExp = homeOnTargetExp + awayOnTargetExp;

            const homeCornersExp = (hCH + aCR) / 2;
            const awayCornersExp = (aCH + hCR) / 2;
            const totalCornersExp = homeCornersExp + awayCornersExp;

            document.getElementById('lambdaHomeVal').innerText = lambdaHome.toFixed(2);
            document.getElementById('lambdaAwayVal').innerText = lambdaAway.toFixed(2);

            function factorial(n) {
                if (n === 0 || n === 1) return 1;
                let accum = 1;
                for (let i = 2; i <= n; i++) accum *= i;
                return accum;
            }

            function poisson(lambda, k) {
                return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
            }

            function getOddAndBadge(probDecimal) {
                let prob = Math.max(0.01, Math.min(0.99, probDecimal));
                let odd = (1 / prob).toFixed(2);
                let badge = '';
                if (prob >= 0.65) {
                    badge = ` <span style="background: #10b981; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">🔥 Value</span>`;
                }
                return `<strong>${(prob * 100).toFixed(1)}%</strong> <span style="color: #38bdf8; font-size: 0.85rem;">(Cuota: ${odd})</span>${badge}`;
            }

            function poissonOverProbRaw(lambda, threshold) {
                let cumulative = 0;
                for (let k = 0; k <= threshold; k++) {
                    cumulative += poisson(lambda, k);
                }
                return Math.max(0.01, Math.min(0.99, 1 - cumulative));
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

            document.getElementById('homeWinProb').innerHTML = getOddAndBadge(homeWin);
            document.getElementById('drawProb').innerHTML = getOddAndBadge(draw);
            document.getElementById('awayWinProb').innerHTML = getOddAndBadge(awayWin);
            document.getElementById('bttsYes').innerHTML = getOddAndBadge(bttsYes);
            document.getElementById('over25').innerHTML = getOddAndBadge(over25);
            document.getElementById('under25').innerHTML = getOddAndBadge(1 - over25);

            scoreProbs.sort((x, y) => y.prob - x.prob);
            const topScoresList = document.getElementById('topScoresList');
            topScoresList.innerHTML = '';
            for (let i = 0; i < 4; i++) {
                const item = scoreProbs[i];
                const li = document.createElement('li');
                let scoreOdd = (1 / Math.max(0.01, item.prob)).toFixed(2);
                li.innerHTML = `<span>Local ${item.h} - ${item.a} Visitante</span> <strong>${(item.prob * 100).toFixed(1)}%</strong> <span style="color: #38bdf8; font-size: 0.85rem;">(Cuota: ${scoreOdd})</span>`;
                topScoresList.appendChild(li);
            }

            const homeShotsThresh = Math.floor(homeShotsExp - 0.5);
            const awayShotsThresh = Math.floor(awayShotsExp - 0.5);
            const homeOnTargetThresh = Math.floor(homeOnTargetExp - 0.5);
            const awayOnTargetThresh = Math.floor(awayOnTargetExp - 0.5);
            const homeCornersThresh = Math.floor(homeCornersExp - 0.5);
            const awayCornersThresh = Math.floor(awayCornersExp - 0.5);
            const totalShotsThresh = Math.floor(totalShotsExp - 0.5);
            const totalOnTargetThresh = Math.floor(totalOnTargetExp - 0.5);
            const totalCornersThresh = Math.floor(totalCornersExp - 0.5);
            const totalGoalsThresh = Math.floor(totalGoalsExp - 0.5);

            const pHShots = poissonOverProbRaw(homeShotsExp, homeShotsThresh);
            const pAShots = poissonOverProbRaw(awayShotsExp, awayShotsThresh);
            const pHOnTarget = poissonOverProbRaw(homeOnTargetExp, homeOnTargetThresh);
            const pAOnTarget = poissonOverProbRaw(awayOnTargetExp, awayOnTargetThresh);
            const pHCorners = poissonOverProbRaw(homeCornersExp, homeCornersThresh);
            const pACorners = poissonOverProbRaw(awayCornersExp, awayCornersThresh);

            const pTotalShots = poissonOverProbRaw(totalShotsExp, totalShotsThresh);
            const pTotalOnTarget = poissonOverProbRaw(totalOnTargetExp, totalOnTargetThresh);
            const pTotalCorners = poissonOverProbRaw(totalCornersExp, totalCornersThresh);
            const pTotalGoals = poissonOverProbRaw(totalGoalsExp, totalGoalsThresh);

            document.getElementById('individualStatsContainer').innerHTML = `
                <div style="background: rgba(15, 23, 42, 0.4); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #38bdf8;">
                    <h4 style="color: #38bdf8; margin-bottom: 6px;">🏠 Equipo Local</h4>
                    <div style="margin: 4px 0;">• Remates: <strong>${homeShotsExp.toFixed(1)}</strong> (Más de ${homeShotsThresh}.5: ${getOddAndBadge(pHShots)})</div>
                    <div style="margin: 4px 0;">• Remates a Puerta: <strong>${homeOnTargetExp.toFixed(1)}</strong> (Más de ${homeOnTargetThresh}.5: ${getOddAndBadge(pHOnTarget)})</div>
                    <div style="margin: 4px 0;">• Tiros de Esquina: <strong>${homeCornersExp.toFixed(1)}</strong> (Más de ${homeCornersThresh}.5: ${getOddAndBadge(pHCorners)})</div>
                </div>
                <div style="background: rgba(15, 23, 42, 0.4); padding: 12px; border-radius: 8px; border-left: 4px solid #f43f5e;">
                    <h4 style="color: #f43f5e; margin-bottom: 6px;">✈️ Equipo Visitante</h4>
                    <div style="margin: 4px 0;">• Remates: <strong>${awayShotsExp.toFixed(1)}</strong> (Más de ${awayShotsThresh}.5: ${getOddAndBadge(pAShots)})</div>
                    <div style="margin: 4px 0;">• Remates a Puerta: <strong>${awayOnTargetExp.toFixed(1)}</strong> (Más de ${awayOnTargetThresh}.5: ${getOddAndBadge(pAOnTarget)})</div>
                    <div style="margin: 4px 0;">• Tiros de Esquina: <strong>${awayCornersExp.toFixed(1)}</strong> (Más de ${awayCornersThresh}.5: ${getOddAndBadge(pACorners)})</div>
                </div>
            `;

            document.getElementById('expTotalShots').innerHTML = `${totalShotsExp.toFixed(1)} <span style="font-size:0.85rem; color:#38bdf8;">(Más de ${totalShotsThresh}.5: ${getOddAndBadge(pTotalShots)})</span>`;
            document.getElementById('expTotalOnTarget').innerHTML = `${totalOnTargetExp.toFixed(1)} <span style="font-size:0.85rem; color:#38bdf8;">(Más de ${totalOnTargetThresh}.5: ${getOddAndBadge(pTotalOnTarget)})</span>`;
            document.getElementById('expTotalCorners').innerHTML = `${totalCornersExp.toFixed(1)} <span style="font-size:0.85rem; color:#38bdf8;">(Más de ${totalCornersThresh}.5: ${getOddAndBadge(pTotalCorners)})</span>`;

            function generateDynamicRangeTable(lambda, defaultThres) {
                let start = Math.max(0, defaultThres - 2);
                let html = '<div style="font-size: 0.85rem; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">';
                for (let t = start; t < start + 5; t++) {
                    let prob = poissonOverProbRaw(lambda, t);
                    let odd = (1 / prob).toFixed(2);
                    let colorStyle = prob >= 0.65 ? 'color: #10b981; font-weight: bold;' : '';
                    let badge = prob >= 0.65 ? ' 🔥 Value' : '';
                    let highlight = (t === defaultThres) ? 'border-left: 3px solid #38bdf8; padding-left: 4px;' : '';
                    
                    html += `<div style="${highlight} ${colorStyle}">Más de ${t}.5 -> <strong>${(prob * 100).toFixed(1)}%</strong> (Cuota: ${odd})${badge}</div>`;
                }
                html += '</div>';
                return html;
            }

            document.getElementById('recommendationsList').innerHTML = `
                <!-- 1. GOLES -->
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 12px; background: rgba(15, 23, 42, 0.5); padding: 10px; border-radius: 8px; border-left: 4px solid #38bdf8;">
                    ⚽ <strong>Desglose de Márgenes - Goles Totales (${totalGoalsExp.toFixed(2)} esp.):</strong>
                    ${generateDynamicRangeTable(totalGoalsExp, totalGoalsThresh)}
                </div>
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 12px; background: rgba(15, 23, 42, 0.4); padding: 10px; border-radius: 8px;">
                    🏠 <strong>Goles - Local (${lambdaHome.toFixed(2)} esp.):</strong>
                    ${generateDynamicRangeTable(lambdaHome, Math.floor(lambdaHome - 0.5))}
                </div>
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 20px; background: rgba(15, 23, 42, 0.4); padding: 10px; border-radius: 8px;">
                    ✈️ <strong>Goles - Visitante (${lambdaAway.toFixed(2)} esp.):</strong>
                    ${generateDynamicRangeTable(lambdaAway, Math.floor(lambdaAway - 0.5))}
                </div>

                <!-- 2. REMATES TOTALES -->
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 12px; background: rgba(15, 23, 42, 0.5); padding: 10px; border-radius: 8px; border-left: 4px solid #38bdf8;">
                    📈 <strong>Desglose de Márgenes - Remates Totales Partido (${totalShotsExp.toFixed(1)} esp.):</strong>
                    ${generateDynamicRangeTable(totalShotsExp, totalShotsThresh)}
                </div>
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 12px; background: rgba(15, 23, 42, 0.4); padding: 10px; border-radius: 8px;">
                    🏠 <strong>Remates - Local (${homeShotsExp.toFixed(1)} esp.):</strong>
                    ${generateDynamicRangeTable(homeShotsExp, homeShotsThresh)}
                </div>
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 20px; background: rgba(15, 23, 42, 0.4); padding: 10px; border-radius: 8px;">
                    ✈️ <strong>Remates - Visitante (${awayShotsExp.toFixed(1)} esp.):</strong>
                    ${generateDynamicRangeTable(awayShotsExp, awayShotsThresh)}
                </div>

                <!-- 3. REMATES A PUERTA -->
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 12px; background: rgba(15, 23, 42, 0.5); padding: 10px; border-radius: 8px; border-left: 4px solid #38bdf8;">
                    ⚡ <strong>Desglose de Márgenes - Remates a Puerta Totales (${totalOnTargetExp.toFixed(1)} esp.):</strong>
                    ${generateDynamicRangeTable(totalOnTargetExp, totalOnTargetThresh)}
                </div>
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 12px; background: rgba(15, 23, 42, 0.4); padding: 10px; border-radius: 8px;">
                    🏠 <strong>Remates a Puerta - Local (${homeOnTargetExp.toFixed(1)} esp.):</strong>
                    ${generateDynamicRangeTable(homeOnTargetExp, homeOnTargetThresh)}
                </div>
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 20px; background: rgba(15, 23, 42, 0.4); padding: 10px; border-radius: 8px;">
                    ✈️ <strong>Remates a Puerta - Visitante (${awayOnTargetExp.toFixed(1)} esp.):</strong>
                    ${generateDynamicRangeTable(awayOnTargetExp, awayOnTargetThresh)}
                </div>

                <!-- 4. TIROS DE ESQUINA -->
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 12px; background: rgba(15, 23, 42, 0.5); padding: 10px; border-radius: 8px; border-left: 4px solid #38bdf8;">
                    🚩 <strong>Desglose de Márgenes - Tiros de Esquina Totales (${totalCornersExp.toFixed(1)} esp.):</strong>
                    ${generateDynamicRangeTable(totalCornersExp, totalCornersThresh)}
                </div>
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; margin-bottom: 12px; background: rgba(15, 23, 42, 0.4); padding: 10px; border-radius: 8px;">
                    🏠 <strong>Tiros de Esquina - Local (${homeCornersExp.toFixed(1)} esp.):</strong>
                    ${generateDynamicRangeTable(homeCornersExp, homeCornersThresh)}
                </div>
                <div class="rec-item" style="flex-direction: column; align-items: flex-start; background: rgba(15, 23, 42, 0.4); padding: 10px; border-radius: 8px;">
                    ✈️ <strong>Tiros de Esquina - Visitante (${awayCornersExp.toFixed(1)} esp.):</strong>
                    ${generateDynamicRangeTable(awayCornersExp, awayCornersThresh)}
                </div>
            `;

            if (resultsSection) resultsSection.style.display = 'block';
        });
    }
});
