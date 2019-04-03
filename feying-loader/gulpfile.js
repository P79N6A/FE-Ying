const gulp = require('gulp');
const ts = require('gulp-typescript');
const { watch } = require('gulp');
const tsProject = ts.createProject('tsconfig.json');
const watcher = watch(['./src/**/*.ts']);

const staticPath = ['./src/**/*.txt', './src/**/*.json', './src/**/*.js'];

const staticTask = cb => {
    gulp.src(staticPath).pipe(gulp.dest('dist'));
    cb();
};

const build = cb => {
    // staticTask(cb)
    tsProject
        .src()
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));
    cb();
};

const watchTask = cb => {
    build(cb);
    watcher.on('change', () => {
        build(cb);
        cb();
    });
};

exports.build = build;

exports.watch = watchTask;
