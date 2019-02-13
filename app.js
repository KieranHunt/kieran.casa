(function() {
  console.log('📓: https://github.com/KieranHunt/kieran.casa')

  // Pick profile picture

  var id = 'default-picture'
  const date = new Date()
  if (date.getMonth() === 9)
      id = 'halloween-picture'
  if (date.getMonth() === 11)
      if (date.getDay() <= 24)
          id = 'christmas-picture'
      
  document.getElementById(id).classList.remove('hidden')

  // Set current weather

  fetch('/api/weather.json')
    .then(response => response.json())
    .then(function(weather) {
      tempInFarenheit = weather.currently.apparentTemperature
      tempInCelcius = Math.trunc((tempInFarenheit - 32.0) * (5/9))
      
      tempElement = document.getElementById('tempurature')
      tempElement.innerHTML = `${tempInCelcius}°C`
      tempElement.classList.remove('hidden')
    });

  // Initialize QuickLink
  quicklink();
})();
