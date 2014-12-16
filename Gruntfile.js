'use strict';
module.exports = function(grunt) {

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // Meta definitions
        meta: {
            header: "/*\n" +
                " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today('yyyy-mm-dd') %>)\n" +
                " *  <%= pkg.homepage %>\n" +
                " *\n" +
                " *  <%= pkg.description %>\n" +
                " *\n" +
                " *  Copyright (c) 2010-<%= grunt.template.today('yyyy') %> <%= pkg.author.name %> <<%= pkg.author.url %>>\n" +
                " *  License: <%= pkg.author.license %>\n" +
                " */\n",
                
            buildPath: 'build/app/',
            zipBuildPath: 'build/app.zip'
        },

        // javascript linting with jshint
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                "force": true
            },

            gruntfile: {
                // you can overrides global options for this target here 
                options: {},
                files: {
                    src: ['Gruntfile.js']
                }
            },
            front_end: {
                // you can overrides global options for this target here 
                options: {},
                files: {
                    src: ['js/src/**/*.js']
                }
            }
        },

        // watch and compile scss files to css
        compass: {
            options: {
                config: 'config.rb',
                sassDir: 'css/sass',
                cssDir: 'css/sass-output'
            },
            front_prod: {
                
            },
            front_dev: {
                options: {
                    environment: 'development',
                    watch:true,
                    trace:true,
                    outputStyle: 'compact', // nested, expanded, compact, compressed.
                    specify: ['css/sass/*.{scss,sass}']
                }
            }
        },

        // Copy files from bower_component folder to right places
        copy: {
            
            jquery: {

                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: '<%= pkg.bower.components %>jquery/dist/',      // Src matches are relative to this path.
                        src: ['jquery.min.js', 'jquery.min.map'],      // Actual pattern(s) to match.
                        dest: 'js/libs/'   // Destination path prefix.
                    }
                ]
            },
            
            plugins_averta: {

                files: [
                    {
                      expand: true,     // Enable dynamic expansion.
                      cwd: '<%= pkg.bower.components %>',    // Src matches are relative to this path.
                      src: ['**/averta-*.js'],      // Actual pattern(s) to match.
                      dest: 'js/libs/plugins/averta',   // Destination path prefix.
                      ext: '',          // Dest filepaths will have this extension.
                      extDot: '',        // Extensions in filenames begin after the first dot
                      flatten: true
                    }
                ]
            },

            fitvids: {

                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: '<%= pkg.bower.components %>fitvids/',      // Src matches are relative to this path.
                        src: ['jquery.fitvids.js'],      // Actual pattern(s) to match.
                        dest: 'js/libs/plugins/'   // Destination path prefix.
                    }
                ]
            },
            
            imagesloaded: {

                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: '<%= pkg.bower.components %>imagesloaded/',      // Src matches are relative to this path.
                        src: ['imagesloaded*min.js'],      // Actual pattern(s) to match.
                        dest: 'js/libs/plugins/',   // Destination path prefix.
                        flatten: true,
                        rename: function( dest, src ) {
                            return dest + src.replace(/[^\/]*$/, "") + "jquery.imagesloaded.min.js";
                        }
                    }
                ]
            }
            
        },

        // merge js files
        concat: {

            front_scripts: {
                options: {
                    // separator: "\n\n/* ================== init.averta.js =================== */\n\n;",
                    banner: "/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %>\n" +
                        " *  Scripts for initializing plugins \n" +
                        " *  <%= pkg.homepage %>\n" +
                        " *  Copyright (c) <%= grunt.template.today('yyyy') %>;\n" +
                        " */\n\n",
                    process: function(src, filepath) {
                        var separator = "\n\n/* ================== " + filepath + " =================== */\n\n\n";
                        return (separator + src).replace(/;\s*$/, "") + ";"; // make sure always a semicolon is at the end
                    },
                },
                src: ['js/src/*.js'],
                dest: 'js/scripts.js'
            }

        },

        // css minify
        cssmin: {
            options: {
                keepSpecialComments: 1
            },
            add_banner: {
                options: {
                    banner: '/* The minified file from concating "base.css" and "main.css" files */'
                },
                files: {
                    'css/all.css': ['css/base.css', 'css/main.css']
                }
            }
            minify: {
                expand: true,
                cwd: 'css',
                src: ['*.css', '!*.min.css'],
                dest: 'css',
                ext: '.min.css'
            }
        },
        
        shell:{
            bower_jquery:{
                command: 'bower update jquery'
            },
            // Sync package.json version with git repo version
            updateVersion:{
                command: 'npm version $(git describe --tags `git rev-list --tags --max-count=1`);'
            },
            // Increase package.json version one step
            bumpVersion: {
                command: 'npm version patch'
            },
            zipBuild: {
                command: 'zip -r <%= meta.zipBuildPath %> <%= meta.buildPath %>'
            }
        },
    
        clean: {
            build: [
                '<%= meta.buildPath %>', '<%= meta.zipBuildPath %>', 
            ]
        },
        
        sass: {
            front_dev: {                        
                options: {                      
                    style: 'expanded',
                    trace:true,
                    quiet:false,
                    compass:true,
                    require:'rgbapng',
                    cacheLocation: '.sass-cache',
                    banner: '',
                    update:true,
                    
                    loadPath: '/volumes/LAB/lab/framework'

                },
                files: {
                    'css/sass-output/base.css': 'css/sass/base.scss'
                }
            }
        },
        

        // autoprefixer
        autoprefixer: {
            options: {
                browsers: ['last 2 versions', 'ie 9', 'ios 7', 'android 4'],
                map: false
            },
            build:{
                expand: true,
                cwd:  '<%= meta.buildPath %>',
                src: [ '**/*.css' ],
                dest: '<%= meta.buildPath %>'
            }
        },

        // uglify to concat, minify, and make source maps
        uglify: {

            options: {
                compress: {
                    drop_console: true
                },
                banner: ""
            },

            front_script_js: {
                options: {
                    sourceMap: true,
                    mangle: false,
                    compress: false,
                    preserveComments: 'some'
                },
                files: {
                    'js/script.min.js': ['js/script.js']
                }
            }

        },

        // image optimization
        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 7,
                    progressive: true,
                    interlaced: true
                },
                files: [{
                    expand: true,
                    cwd: 'css/images/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: ''
                }]
            }
        },

        // Fetch and updated theme font icon based on '_devDependencies/fontello/config.json' file
        fontello: {
            options: {
                sass: true,
                force: true
            },
            dev: {
                options: {
                    config  : 'css/fonts/fontello/config.json',
                    fonts   : 'css/fonts/fontello',
                    styles  : 'css/fonts/fontello/css',
                    scss    : true
                }
            }
        },

        // Fetch and updated moderizr based on configurations
        modernizr: {
            dist: {
                // [REQUIRED] Path to the build you're using for development.
                "devFile" : "js/libs/modernizr-custom.js",

                // [REQUIRED] Path to save out the built file.
                "outputFile" : "js/libs/modernizr-custom.js",

                // Based on default settings on http://modernizr.com/download/
                "extra" : {
                    "shiv" : true,
                    "printshiv" : false,
                    "load" : true,
                    "mq" : false,
                    "cssclasses" : true
                },

                // Based on default settings on http://modernizr.com/download/
                "extensibility" : {
                    "addtest" : false,
                    "prefixed" : false,
                    "teststyles" : false,
                    "testprops" : false,
                    "testallprops" : false,
                    "hasevents" : false,
                    "prefixes" : false,
                    "domprefixes" : false
                },

                // By default, source is uglified before saving
                "uglify" : true,

                // Define any tests you want to implicitly include.
                "tests" : [
                    'boxshadow',
                    'cssanimations',
                    'csscolumns',
                    'csstransitions',
                    'csstransforms3d',
                    'csstransforms',
                    'cssgradients',
                    'canvas',
                    'audio',
                    'video',
                    'input',
                    'inputtypes',
                    'svg',
                    'touch',
                    'flexbox',
                    'fullscreen_api'
                ],

                // By default, this task will crawl your project for references to Modernizr tests.
                // Set to false to disable.
                "parseFiles" : true,

                // When parseFiles = true, this task will crawl all *.js, *.css, *.scss files, except files that are in node_modules/.
                // You can override this by defining a "files" array below.
                // "files" : {
                    // "src": []
                // },

                // When parseFiles = true, matchCommunityTests = true will attempt to
                // match user-contributed tests.
                "matchCommunityTests" : false,

                // Have custom Modernizr tests? Add paths to their location here.
                "customTests" : []
            }
        },

        // watch for changes and trigger sass, jshint, uglify and livereload
        watch: {

            autoreload: {
                options: { livereload: true },
                files: ['*.css', 'css/*.css', 'js/src/*.js', 'js/*.js', 'css/images/**/*.{png,jpg,jpeg,gif,webp,svg}'],
                tasks: []
            }
        },

        // Running multiple blocking tasks
        concurrent: {
            watch_frontend_scss: {
                tasks: ['compass', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        // deploy via rsync
        deploy: {
            options: {
                args: ["--verbose -zP"], // z:compress while transfering data, P:display progress
                exclude: ['.git*', 'node_modules', '.sass-cache', 'Gruntfile.js', 'package.json', 
                          '.*', 'README.md', 'config.rb', '.jshintrc', 'bower.json',
                          'bower_components','build', 'contributors.txt', 'config.rb'
                ],
                recursive: true,
                syncDestIgnoreExcl: true
            },
            dist: {
                options: {
                    src: "./",
                    dest: "<%= meta.buildPath %>"
                }
            },
            staging: {
                 options: {
                    src: "<%= meta.buildPath %>",
                    dest: "~/path/to/theme",
                    host: "user@host.com",
                    delete: true // becareful, this option could cause data loss
                }
            },
            production: {
                options: {
                    src: "<%= meta.buildPath %>",
                    dest: "~/path/to/theme",
                    host: "user@host.com"
                }
            }
        }

    });

    // rename tasks
    grunt.renameTask('rsync', 'deploy');

    // register task
    grunt.registerTask( 'default'       , ['watch']);

    grunt.registerTask( 'syncversion'   , ['shell:updateVersion'] );
    grunt.registerTask( 'bump'          , ['shell:bumpVersion'  ] ); 
    
    grunt.registerTask( 'prebuild'      , ['clean:build'] );
    
    grunt.registerTask( 'pack'          , ['shell:zipBuild'] );

    grunt.registerTask( 'build'         , ['deploy:build', 'autoprefixer:build', 'pack']);

    grunt.registerTask( 'staging'       , ['build', 'deploy:staging'   ] );
    grunt.registerTask( 'production'    , ['build', 'deploy:production'] );

    grunt.registerTask( 'release'       , 'build', 'deploy:staging', 'deploy:production', 'syncversion' );

    grunt.registerTask( 'dev'           , ['concurrent'] );
};
