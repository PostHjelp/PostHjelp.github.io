document.addEventListener('DOMContentLoaded', function() {
    const timeSlider = document.getElementById('time-slider');
    const timeValue = document.getElementById('time-value');

    if (timeSlider && timeValue) {
        noUiSlider.create(timeSlider, {
            start: [480], // 480 minutter = 08:00
            connect: [true, true],
            range: {
                'min': 0,
                'max': 1439 // 1439 minutter = 23:59
            },
            step: 1,
            format: {
                to: value => {
                    const hours = Math.floor(value / 60);
                    const minutes = Math.floor(value % 60);
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                },
                from: value => Number(value)
            }
        });

        timeSlider.noUiSlider.on('update', function(values, handle) {
            timeValue.innerHTML = `Valgt tid: ${values[0]}`;
        });

        document.getElementById('confirm-time').addEventListener('click', async () => {
            const time = timeValue.textContent.replace('Valgt tid: ', '');
            if (time) {
                await updateWorkForReview(userId, userName, workId, workDate, time);
                window.location.href = "arbeidsportal.html";
            } else {
                alert("Tidspunkt ble ikke oppgitt, registreringen avbrutt.");
            }
        });
    } else {
        console.error("Slider elementer ikke funnet i DOM");
    }
});