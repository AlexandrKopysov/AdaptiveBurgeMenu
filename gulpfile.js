const fileinclude = require('gulp-file-include');

let project_folder = "dist"; //Папкп передается заказчику
let source_folder = "#src"; //Исходники
let path = {
  bild: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fontsPath: project_folder + "/fonts/",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}",
    fontsPath: source_folder + "/fonts/",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}",
  },
  clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require("browser-sync").create(),
  fileinclude1 = require("gulp-file-include"),
  del = require("del"),
  scss = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  group_media = require("gulp-group-css-media-queries"),
  clean_css = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  imagemin = require("gulp-imagemin"),
  webp = require("gulp-webp"),
  webphtml = require("gulp-webp-html"),
  webpcss = require("gulp-webpcss"),
  svgSprite = require("gulp-svg-sprite");
  // ttf2woff = require("gulp-ttf2woff"),
  // ttf2woff2 = require("gulp-ttf2woff2");


function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}



function html() {
  return src(path.src.html)
    .pipe(fileinclude1())
    .pipe(webphtml())
    .pipe(dest(path.bild.html))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(webpcss())
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(dest(path.bild.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.bild.css))
    .pipe(browsersync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.bild.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3
      })
    )
    .pipe(dest(path.bild.img))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude1())
    .pipe(dest(path.bild.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.bild.js))
    .pipe(browsersync.stream())
}

// function fonts() {
//   src(path.src.fontsPath)
//     .pipe(ttf2woff())
//     .pipe(dest(path.build.fontsPath));
//   return src(path.src.fontsPath)
//     .pipe(ttf2woff2())
//     .pipe(dest(path.build.fontsPath));
// };

gulp.task('svgSprite', function () {
  return gulp.src([source_folder + '/iconsprite/*.svg'])
  pipe(svgSprite({
    mode: {
      stack: {
        sprite: "../icons/icons/svg",
        example: true
      }
    },
  }))
    .pipe(dest(path.build.img))
})

function watchFiles(param) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

function clean(params) {
  return del(path.clean);
}



let bild = gulp.series(clean, gulp.parallel(js, css, html, images));
let watch = gulp.parallel(bild, watchFiles, browserSync);

// exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.bild = bild;
exports.watch = watch;
exports.default = watch;