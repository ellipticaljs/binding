var gulp=require('gulp'),
    fs = require('fs-extra'),
    concat=require('gulp-concat'),
    uglify = require('gulp-uglify'),
    BUILD_NAME='elliptical.binding.js',
    MIN_NAME='elliptical.binding.min.js',
    REPO_NAME='elliptical binding',
    UTILS='./node_modules/elliptical-utils/dist/elliptical.utils.js',
    JQ='./node_modules/component-extensions/dist/jquery.js',
    TEMPLATE='./node_modules/component-extensions/lib/prototype.template.js',
    DUST='./node_modules/component-extensions/dist/dust.js',
    MS='./node_modules/elliptical-mutation-summary/dist/mutation.summary.js',
    EMS='./node_modules/elliptical-mutation-summary/dist/elliptical.mutation.summary.js',
    LIB='./lib/binding.js',
    DIST='./dist',
    BUNDLE_JSON=require('./bundle.json'),
    BUNDLE='./bundle';


gulp.task('default',function(){
    console.log(REPO_NAME + ' ..."tasks: gulp build|minify|bundle"');
});

gulp.task('build',function(){
    fileStream(UTILS,DIST);
    fileStream(DUST,DIST);
    fileStream(JQ,DIST);
    fileStream(MS,DIST);
    fileStream(EMS,DIST);
    concatFileStream(TEMPLATE,DIST,'elliptical.extensions.template.js');
    concatFileStream(LIB,DIST,BUILD_NAME);
});

gulp.task('minify',function(){
    minFileStream(UTILS,DIST,'elliptical.utils.min.js');
    minFileStream(DUST,DIST,'dust.min.js');
    minFileStream(JQ,DIST,'jquery.min.js');
    minFileStream(MS,DIST,'mutation.summary.min.js');
    minFileStream(EMS,DIST,'elliptical.mutation.summary.min.js');
    minFileStream(TEMPLATE,DIST,'elliptical.extensions.template.min.js');
    minFileStream(LIB,DIST,MIN_NAME);
});

gulp.task('bundle',function(){
    fileStream(DUST,BUNDLE);
    fileStream(JQ,BUNDLE);
    concatFileStream(BUNDLE_JSON,BUNDLE,'elliptical.binding.js');
});

function srcStream(src){
    if(src===undefined) src=BUILD_JSON;
    return gulp.src(src);
}

function concatStream(name,src){
    if(src===undefined) src=BUILD_JSON;
    return srcStream(src)
        .pipe(concat(name))
}

function fileStream(src,dest){
    gulp.src(src)
        .pipe(gulp.dest(dest));
}

function concatFileStream(src,dest,name){
    gulp.src(src)
        .pipe(concat(name))
        .pipe(gulp.dest(dest));
}

function minFileStream(src,dest,name){
    gulp.src(src)
        .pipe(concat(name))
        .pipe(uglify())
        .pipe(gulp.dest(dest));
}