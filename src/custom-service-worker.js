const fs = require('fs');

if (fs.existsSync('build/service-worker.js')) {
  fs.appendFile(
    'build/service-worker.js',
    `
self.addEventListener('fetch', function(event) {
    if (event.request.url.match('^.*(/file/).*$')) {
        return false;
    }
    if (event.request.url.match('^.*(/api/).*$')) {
      return false;
  }
});
`,
    error => {
      if (error) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>ERROR');
        console.log(error);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
      } else {
        console.log('appending codes to cra service worker');
      }
    },
  );
} else {
  console.log('service-worker.js not found');
}
