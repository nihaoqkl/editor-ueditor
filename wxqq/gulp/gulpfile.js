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
    revCollector  = require('gulp-rev-collector'),
    clean  = require('gulp-clean'),
    livereload = require('gulp-livereload');

gulp.task('clean',function(){
    return gulp.src(['asset/rev','../wxqq/js','../wxqq/css'], {read: false})
        .pipe(clean({force: true}));
});

gulp.task('jsmin', function () {
    return gulp.src(['asset/js/**/*'])
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('../wxqq/js'))
        .pipe( rev.manifest() )
        .pipe( gulp.dest( 'asset/rev/js' ) )
        .pipe(livereload());
});

gulp.task('less', function () {
    return gulp.src(['asset/css/enter.less'])
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(cssmin())
        .pipe(rev())
        .pipe(gulp.dest('../wxqq/css'))
        .pipe( rev.manifest() )
        .pipe( gulp.dest( 'asset/rev/css' ) )
        .pipe(livereload());
});

gulp.task('rev',['html'], function() {
    return gulp.src(['asset/rev/**/*.json', 'asset/rev/dev.html'])   //- 读取rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                        //- 执行文件内css名的替换
        .pipe(gulp.dest('../'));                     //- 替换后的文件输出的目录

});
gulp.task('olrev',['olhtml'], function() {
    return gulp.src(['asset/rev/**/*.json', 'asset/rev/online.html'])   //- 读取rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                        //- 执行文件内css名的替换
        .pipe(gulp.dest('../'));                     //- 替换后的文件输出的目录

});

gulp.task('html',['less','jsmin'], function () {
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

    return gulp.src('asset/html/wxqq.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('asset/rev'))
        .pipe(livereload());
});

gulp.task('olhtml',['less','jsmin'], function () {
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

    return gulp.src('asset/html/online.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('asset/rev'))
        .pipe(livereload());
});

gulp.task('watch',function(){
    livereload.listen({ start: true });
    gulp.watch('asset/css/**/*.less', ['dev']);
    gulp.watch('asset/js/**/*.js', ['dev']);
    gulp.watch('asset/html/**/*.html', ['dev']);

});
gulp.task('watchol',function(){
    livereload.listen({ start: true });
    gulp.watch('asset/css/**/*.less', ['online']);
    gulp.watch('asset/js/**/*.js', ['online']);
    gulp.watch('asset/html/**/*.html', ['online']);

});

gulp.task('online', ['clean'], function(){
    return gulp.start('olrev');
});

gulp.task('dev', ['clean'], function(){
    return gulp.start('rev');
});

gulp.task('default', ['dev','watch']);

gulp.task('build', ['online','watchol']);


//gulp dev 测试使用,代码 成功后复制到online文件里去用online编译上线
//gulp online 上线使用