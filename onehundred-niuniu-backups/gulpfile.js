/**
*  Create by qishanquan
*  2018-4-28 13:18:56
*/
var gulp = require("gulp"),
    concat = require("gulp-concat"),
    gorder = require("gulp-order"),
    gutil = require("gulp-util"),
    plumber = require("gulp-plumber"),
    notify = require("gulp-notify"),
    uglify = require("gulp-uglify"),
    watch = require("gulp-watch");

var files = require("./gulp_config.json");

function buildJs() {
    gutil.log('build-begin');
    gulp
        .src(files.src, {base:'./'})
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(gorder(files.order))
        //.pipe(files.needUglify?uglify():'')
        .pipe(concat(files.target))
        .pipe(gulp.dest(files.targetPath));
    gutil.log('build-finish');
}

gulp.task('default', function () {
    buildJs();
    gutil.log('build-init');
    return watch(files.src, function () {
        buildJs();
    });
});