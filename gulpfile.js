var gulp = require('gulp');
var ts = require("gulp-typescript");
var server = require('gulp-express');
var tsProject = ts.createProject("tsconfig.json");
var browserSync = require('browser-sync').create();

gulp.task('browserSync', function() {
    browserSync.init({
        proxy: "localhost:8080",
        port: 3000,
        files: ["dist/**/*"]
    })
})

gulp.task('copy-other', function() {
    // place code for your default task here
    server.stop();
    return gulp.src(["src/**/*", "!src/**/*.ts"])
        .pipe(gulp.dest("dist"))
});

gulp.task('dev', ['copy-other'], function(){
    gulp.src("src/**/*.ts")
        .pipe(tsProject())
        .pipe(gulp.dest("dist"))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('server', function () {
    // Start the server at the beginning of the task 
    server.run(['dist/index.js']);
});

gulp.task('watch', ['browserSync', 'dev', 'server'], function(){
    gulp.watch('src/**/*', ['dev', 'server']); 
    // Other watchers
})

gulp.task('default', function() {
  // place code for your default task here
});