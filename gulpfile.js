var gulp = require('gulp');
var ts = require("gulp-typescript");
var server = require('gulp-express');
var tsProject = ts.createProject("tsconfig.json");
var pug = require('gulp-pug');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
let cleanCSS = require('gulp-clean-css');
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

gulp.task('static-build', function(){
    gulp.src("src/**/*.ts")
        .pipe(tsProject())
        .pipe(gulp.dest("dist"))

    //view
    gulp.src("dist/views/*.pug")
        .pipe(pug({
            pretty: true
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest("static-build"))

    //css
    gulp.src("dist/public/**/*.css")
        .pipe(cleanCSS({compatibility: '*'}))
        .pipe(gulp.dest("static-build"))
    //js 
    gulp.src("dist/public/**/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("static-build"))
})