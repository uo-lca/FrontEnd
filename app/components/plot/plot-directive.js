angular.module('lcaApp.plot', [
    'lcaApp.plot.directive',
    'lcaApp.plot.service'
]);

/**
 * @ngdoc directive
 * @name lcaApp.plot.directive:plot
 * @restrict E
 * @function
 * @scope
 *
 * @description
 * Plot directive.
 *
 * @param {object} config Object created by PlotService.createConfig
 * @param {[]} data Array of objects providing data
 */
angular.module('lcaApp.plot.directive', ['lcaApp.plot.service', 'd3', 'lcaApp.format'])
    .directive('plot', ['d3Service', 'FormatService',
        function (d3Service, FormatService) {

        function link(scope, element) {
            var parentElement = element[0],             // Directive template element
                svgElement = parentElement.parentNode,  // Parent of template element must be an svg element
                svg =  d3Service.select(svgElement),
                plot = svg.select("g.lcia-bar-container"),
                chart, xAxis = null, yAxis = null,
                width = 0,                              // chart width, without margins and offsets
                height = 0,                             // chart height, without margins and offsets
                offset = { width: 0, height: 0},
                xScale, yScale,
                numFormat = FormatService.format("^.2g"),
            // Future enhancement: make these hard-coded values configurable
                numWidth = 55, labelPadding = 5;

            /**
             * Create chart group, if it does not already exist.
             * Translate to position x = left margin and offset, y = top margin and offset
             * @param { object } config    plot configuration, contains margins and offsets
             */
            function createChart(config) {
                var margin = config.margin(),
                    xDim = config.x(),
                    yDim = config.y(),
                    leftOffset = 0,
                    topOffset = 0;

                if (!xDim ) throw Error ("x dimension must be defined.");
                if (!yDim ) throw Error ("y dimension must be defined.");
                xAxis = xDim.axis();
                yAxis = yDim.axis();
                if (xAxis) topOffset = xAxis.getOffset("top");
                if (yAxis) leftOffset = yAxis.getOffset("left");
                chart = plot.select(".chart-group");
                if (chart.empty()) {
                    chart = plot.append("g")
                        .attr("class", "chart-group");
                }
                chart.attr("transform",
                        "translate(" + (margin.left + leftOffset) + "," + (margin.top + topOffset) + ")");
            }

            /**
             * Calculate chart width and height by subtracting margins and offsets from current svg size
             * @param { object } config
             */
            function updateSize( config) {
                var margin = config.margin(),
                    svgStyle = svgElement.getBoundingClientRect();

                if (yAxis) offset.width = yAxis.offset();
                if (xAxis) offset.height = xAxis.offset();
                width = svgStyle.width - margin.left - margin.right - offset.width;
                height = svgStyle.height - margin.top - margin.bottom - offset.height;
            }

            /**
             * If plot is configured to resize, then resize according to content (bar) size and data length
             * @param { object } config
             * @param { [] } data
             */
            function resizeSvg(config, data) {
                if (config.resizeSvg && data.length) {
                    var content = config.content(),
                        margin = config.margin(),
                        svgSize;

                    if ( content.width()) {
                        width = content.width() * data.length;
                        svgSize = width + margin.left + margin.right + offset.width;
                        svg.attr("width", svgSize);
                    }
                    if ( content.height()) {
                        height = content.height() * data.length;
                        svgSize = height + margin.top + margin.bottom + offset.height;
                        svg.attr("height", svgSize);
                    }
                }
            }

            function drawAxes(config) {
                drawAxisY(config.y().axis());
                drawAxisX(config.x().axis());
            }

            /**
             * Override d3 default tick settings
             * @param { object } axis
             * @param { object } dim    Dimension configuration
             * @param { function } formatter
             */
            function prepareAxisTicks(axis, dim, formatter) {
                if (formatter) axis.tickFormat(formatter);
                if (dim.hasOrdinalScale()) {
                    axis.tickSize(0);
                } else {
                    var scale = axis.scale(),
                        range = scale.range(),
                        tickCount = Math.floor((range[1]-range[0])/(numWidth+labelPadding));
                    axis.ticks(tickCount);
                }
            }

            /**
             * If x dimension has axis configuration, then draw x axis accordingly
             * @param { object } axisConfig
             */
            function drawAxisX(axisConfig) {
                var dim = scope.config.x();

                if (axisConfig && scope.data.length) {
                    var g = chart.select(".x.axis"),
                        orientation = axisConfig.orientation(),
                        axis = d3Service.svg.axis()
                            .scale(xScale)
                            .orient(orientation),
                        unit = dim.unit();

                    if (g.empty()) {
                        g = chart.append("g").attr("class", "x axis");
                    }
                    if (orientation === "bottom") {
                        g.attr("transform", "translate(0," + height + ")");
                    }
                    prepareAxisTicks(axis, dim, axisConfig.tickFormat());
                    g.call(axis);
                    if (dim.hasOrdinalScale()) {
                        //g.selectAll(".tick text")
                        //    .call(d3Service.textWrap, axisConfig.offset());
                    } else if (axisConfig.addLine) {
                        var x0 = xScale(0);
                        // Need to recreate so that it will always be on top
                        chart.select(".x.starting-line").remove();
                        chart.append("line")
                            .attr("class", "x starting-line")
                            .attr("x1", x0)
                            .attr("y1", 0)
                            .attr("x2", x0)
                            .attr("y2", height);
                    }
                    if (unit) {
                        var unitLabel = g.select(".x.unit");
                        if (unitLabel.empty()){
                            unitLabel = g.append("text")
                                .attr("class", "x unit");
                        }
                        unitLabel.attr("text-anchor", "middle")
                            .attr("transform", "translate(" + width/2 + "," + axisConfig.offset() + ")")
                            .text(unit);
                    }
                }
                else {
                    chart.select(".x.axis").remove();
                    chart.select(".x.starting-line").remove();
                }
            }
            /**
             * If y dimension has axis configuration, then draw y axis accordingly
             * @param { object } axisConfig
             */
            function drawAxisY(axisConfig) {
                var dim = scope.config.y();

                if (axisConfig && scope.data.length) {
                    var g = chart.select(".y.axis"),
                        orientation = axisConfig.orientation(),
                        axis = d3Service.svg.axis()
                                .scale(yScale)
                                .orient(orientation);

                    if (g.empty()) {
                        g = chart.append("g").attr("class", "y axis");
                    }
                    if (orientation === "right") {
                        g.attr("transform", "translate(" + width + ", 0)");
                    }
                    prepareAxisTicks(axis, dim, axisConfig.tickFormat());
                    g.call(axis);
                    if (dim.hasOrdinalScale()) {
                        //g.selectAll(".tick text")
                        //    .call(d3Service.textWrap, axisConfig.offset());
                    } else if (axisConfig.addLine) {
                        var line = chart.select(".y.starting-line"),
                            y0 = yScale(0);

                        if (line.empty()) {
                            line = chart.append("line")
                                .attr("class", "y starting-line");
                        }
                        line.attr("x1", 0)
                            .attr("y1", y0)
                            .attr("x2", width)
                            .attr("y2", y0);
                    }
                }
                else {
                    chart.select(".y.axis").remove();
                    chart.select(".y.starting-line").remove();
                }
            }

            /**
             * Create horizontal bar data object containing original data record (d), shape (s), and label (l).
             * Shape has x and width properties.
             * Label has x, y, and anchor properties.
             * @param { object } d  Data record
             * @returns {{d: { object }, s: {x: number, width: number}, l: {x: number, y: number, anchor: number}}}
             */
            function createHBarData(d) {
                var dim = scope.config.x(),
                    xVal = dim.valueFn(),
                    formatter = dim.labelFn() ? dim.labelFn() : numFormat,
                    shape = {
                        x : xScale(Math.min(0, xVal(d))),
                        width : Math.abs(xScale(xVal(d)) - xScale(0))
                    },
                    label = { x : 0, y : 0, anchor : 0 };
                if (shape.width < numWidth) {
                    if (width - shape.width - shape.x < numWidth) {
                        label.x = shape.x - labelPadding;
                        label.anchor = "end";
                    } else {
                        label.x = shape.x + shape.width + labelPadding;
                        label.anchor = "start";
                    }
                }
                else {
                    label.x = shape.x + shape.width /2 ;
                    label.anchor = "middle";
                }
                label.text = formatter(xVal(d));
                return { d: d, s: shape, l: label};
            }

            function drawHorizontalBars(content, data) {
                var shape = content.shape(),
                    barHeight = content.height(),
                    barPadding = content.padding(),
                    barData, barGroups, newGroups;

                barData = data.map( createHBarData);

                barGroups = chart.selectAll(".bar.g").data(barData);
                newGroups = barGroups.enter().append("g").attr("class", "bar g");
                barGroups.exit().remove();
                barGroups.attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

                newGroups.append(shape);
                barGroups.select(shape)
                    .style("fill", content.color())
                    .attr("x", function(d) { return d.s.x; })
                    .attr("y", 0)
                    .attr("width", function(d) { return d.s.width; })
                    .attr("height", barHeight-barPadding);

                newGroups.append("text");
                barGroups.select("text")
                    .attr("x", function(d) { return d.l.x; })
                    .attr("y", barHeight / 2)
                    .attr("dy", ".35em")
                    .style("text-anchor", function (d) { return d.l.anchor; })
                    .text(function(d) { return d.l.text });
            }

            function drawContents(config, data) {
                var content = config.content();
                if (!content) throw Error("Plot content must be defined.");
                if (content.orientation() === "horizontal") {
                    drawHorizontalBars(content, data);
                }
                //Future enhancement - vertical bars and other content types
            }

            /**
             * Create d3 scale. Domain is derived from plot data values, unless provided in dimension
             * configuration.
             * @param { object } dim        Dimension configuration
             * @param { object } plotData   Plot data
             * @param { [] } range          Scale range
             * @returns { d3.scale }
             */
            function createScale(dim, plotData, range) {
                if (!dim.valueFn()) throw Error("Plot dimension must provide valueFn");
                if (!dim.scale()) throw Error("Plot dimension must provide scale type");
                var domain = dim.domain(),
                    valueFn = dim.valueFn(),
                    scale;

                if (!domain) {
                    domain = plotData.map(valueFn);
                    if (dim.scale() === "linear" && domain.length) {
                        if (domain.length === 1 && domain[0]) {
                            domain = domain[0] > 0 ? [0, domain[0]] : [domain[0], 0];
                        } else {
                            domain = d3Service.extent(domain);
                            if (domain[0] > 0) domain[0] = 0;
                            else if (domain[1] < 0) domain[1] = 0;
                        }
                    }
                }
                if (dim.scale() === "linear") {
                    scale = d3Service.scale.linear();
                    scale.domain(domain).range(range).nice();
                } else if (dim.scale() === "ordinal") {
                    scale = d3Service.scale.ordinal();
                    scale.domain(domain).rangeRoundBands(range, .1);
                } else {
                    throw Error("Plot does not support scale type : " + dim.scale());
                }
                return scale;
            }


            function prepareScales(config, data) {
                xScale = createScale(config.x(), data, [0, width]);
                yScale = createScale(config.y(), data, [0, height]);
            }

            /**
             * When scope data changes, create/update chart
             */
            scope.$watch('data', function (newVal) {
                if (svg && scope.config && newVal) {
                    var config = scope.config;

                    createChart(config);
                    if (chart) {
                        updateSize(config);
                        resizeSvg(config, newVal);
                        prepareScales(config, newVal);
                        drawContents(config, newVal);
                        drawAxes(config);
                    }
                }
            },
                true);

        }

        return {
            restrict: 'E',
            scope: { config: "=", data: "=", transform: "@" },
            link: link,
            templateNamespace: "svg",   // svg requires special handling in angular
            replace: true,
            template: "<g class='lcia-bar-container' ng-attr-transform='{{transform}}'></g>"
        }
    }]);
