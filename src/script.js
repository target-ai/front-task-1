class Finder {
    constructor(solution, graph, start, finish) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const { points, links } = this.generateFromGraph(width, height, graph);
        const { edges, vertexes } = this.drawGraph(width, height, points, links);
        const { path } = solution(graph, start, finish);

        this.showPath(edges, vertexes, path);
    }

    /**
     * Отображение графа
     * 
     * @param {Number} width ширина графа
     * @param {Number} height высота графа
     * @param {Object[]} points описание каждой точки графа
     * @param {Object[]} links описание связей между точками графа
     */
    drawGraph(width, height, points, links) {
        const svg = d3.select('body').append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#ccc')

        const g = svg.append('g');

        const edges = g.selectAll('path.link').data(links).enter()
            .append('path')
            .attr('stroke-width', d => d3.interpolateNumber(1, 10)(d.defaultWeight))
            .attr('stroke', d => d3.interpolateLab('green', 'red')(d.defaultWeight))
            .attr('d', d => `M${d.parent.x},${d.parent.y} L${d.children.x},${d.children.y}`);

        const vertexes = g.selectAll('circle.node').data(Object.values(points)).enter()
            .append('circle')
            .attr('fill', '#fff')
            .attr('stroke', '#000')
            .attr('r', d => d.name === 'finish' || d.name === 'start' ? 10 : 5)
            .attr('transform', d => `translate(${d.x},${d.y})`);

        return { edges, vertexes }
    }

    /**
     * Анимация прохождения пути в графе
     * 
     * @param {SVGElement[]} edges ребра графов
     * @param {SVGElement[]} vertexes вершины графов
     * @param {String[]} path путь, необходимо построить
     */
    showPath(edges, vertexes, path) {
        let i = 0;
        let end = path.pop();

        while (path.length) {
            let start = path.pop();

            edges.filter(e => e.children.name === end && e.parent.name === start)
                .transition()
                .delay(i * 500)
                .attr('stroke', '#fc0')
                .attr('stroke-width', 5);

            vertexes.filter(v => v.name === end)
                .transition()
                .delay(i * 500)
                .attr('fill', '#fc0');

            i++;
            end = start;
        }
    }

    /**
     * Создание координат и связей между точками графа
     * 
     * @param {Number} width ширина поля
     * @param {Number} height высота поля
     * @param {Object} graph граф поля
     */
    generateFromGraph(width, height, graph) {
        const points = Object.keys(graph).reduce((_, name) => (_[name] = {
            name,
            x: Math.round((Math.random() * width)),
            y: Math.round((Math.random() * height))
        }) && _, {});

        const maxWeight = Math.max.apply(null, [].concat(...Object.values(graph).map(_ => Object.values(_))));

        const links = [].concat(...Object.keys(graph).map(parent => 
            Object.keys(graph[parent]).map(children => ({
                parent: points[parent],
                children: points[children],
                defaultWeight: graph[parent][children] / maxWeight
            })
        )));

        return { points, links };
    }
}
