/**
 * Created by qkl | QQ:80508567 Wechat:qklandy on 2015/12/16.
 */
var gulp = require('gulp'),
    less = require('gulp-less'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-minify-css'),
    htmlmin = require('gulp-htmlmin'),
    autoprefixer = require('gulp-autoprefixer'),
    rev = require('gulp-rev'),
    revCollector  = require('gulp-rev-collector');


gulp.task('jsmin', function () {
    gulp.src(['asset/js/**/*'])
        .pipe(uglify())
        .pipe(gulp.dest('../js'));
});

gulp.task('less', function () {
    gulp.src(['asset/css/enter.less'])
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(cssmin())
        .pipe(gulp.dest('../css'));
});

gulp.task('buildrev',function(){
    gulp.src(['../css/enter.css', '../js/main.js'])
        .pipe(gulp.dest('asset/rev'))
        .pipe(rev())
        .pipe(gulp.dest('asset/rev'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('asset/rev'));
});

gulp.task('rev', function() {
    gulp.src(['asset/rev/*.json', '../wxqq.html'])   //- 读取rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                        //- 执行文件内css名的替换
        .pipe(gulp.dest('../'));                     //- 替换后的文件输出的目录
});

gulp.task('html', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };

    gulp.src('asset/html/wxqq.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('../'));
});


gulp.task('default', ['jsmin','less','html','buildrev','rev']);