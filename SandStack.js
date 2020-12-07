class SandStack {
    /**
     * initial stack size 
     */
    static INIT_SIZE = 100;
    /**
     * point size in pixels
     */
    static POINT_SIZE = 4;
    /**
     * delay between steps in ms (0 is unstopable)
     */
    static STEP_DELAY = 100;
    /**
     * should it draw then STEP_DELAY set to 0
     */
    static DRAW_ON_ZERO_DELAY = false;
    /**
     * defines maximum stable stack size
     */
    static MAX_SAND_PER_STACK = 4;
    /**
     * turns on adaptive color
     */
    static ADAPTIVE_COLOR = true;
    /**
     * adaptive color offset from white
     */
    static ADAPTIVE_COLOR_OFFSET = 0x66;

    constructor() {
        document.head.innerHTML = '';
        document.body.innerHTML = '<canvas id="ctx"></canvas>';
        document.body.style.margin = 0;
        /**
         * canvas element
         */
        this.canvas = document.getElementById('ctx');
        
        /**
         * canvas 2d context
         */
        this.ctx = this.canvas.getContext('2d');
        this.ctx.canvas.width  = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;

        /**
         * matrix size
         */
        this.size = {
            x: this.canvas.width / SandStack.POINT_SIZE,
            y: this.canvas.height / SandStack.POINT_SIZE,
        };

        if (SandStack.ADAPTIVE_COLOR) {
            /**
             * set of used colours
             */
            this.colors = [];
            const maxColours = SandStack.MAX_SAND_PER_STACK + 2;
            const colorStep = ((0xFF - SandStack.ADAPTIVE_COLOR_OFFSET) / maxColours) |0;
            for (let i = 1; i <= maxColours; i++) {
                this.colors.push('#' + ((maxColours - i) * colorStep).toString(16).repeat(3));
            }
        }

        this.init();
    }

    point(x, y, size = 0) {
        return { x, y, size };
    }

    /**
     * init function
     */
    init() {
        /**
         * steps count
         */
        this.steps = 0;
        /**
         * simulation state
         */
        this.running = false;

        /**
         * dots matrix to avoid search by stack in step() method
         */
        this.matrix = [];
        for (let i = 0; i < this.size.x; i++) {
            if (!this.matrix[i]) this.matrix.push([]);
            for (let j = 0; j < this.size.y; j++) {
                this.matrix[i].push(null);
            }
        }

        const centerPoint = this.point((this.size.x / 2)|0, (this.size.y / 2)|0, SandStack.INIT_SIZE);
        this.matrix[centerPoint.x][centerPoint.y] = centerPoint;
        /**
         * dots stact to avoid search by matrix in step() method
         */
        this.stack = [centerPoint];

        this.draw();
    }

    /**
     * simulation step
     * @returns {Number} count of updated points
     */
    step() {
        const stack = [...this.stack];
        this.stack = [];

        let pointsUpdated = 0;
        for (const point of stack) {
            if (point.size >= SandStack.MAX_SAND_PER_STACK) {
                pointsUpdated++;
                point.size -= SandStack.MAX_SAND_PER_STACK;
                for (let i = 0; i < 4; i++) {
                    const newPoint = this.point(point.x + (i % 2 ? (i - 2) : 0), point.y + (i % 2 ? 0 : (i - 1)), 1);
                    if (newPoint.x < 0 || newPoint.x > this.size.x || newPoint.y < 0 || newPoint.y > this.size.y) continue;
                    if (this.matrix[newPoint.x][newPoint.y]) {
                        this.matrix[newPoint.x][newPoint.y].size += SandStack.MAX_SAND_PER_STACK / 4;
                    } else {
                        this.matrix[newPoint.x][newPoint.y] = newPoint;
                        this.stack.push(newPoint);
                    }
                }
            }
            if (point.size > 0) this.stack.push(point);
            else this.matrix[point.x][point.y] = null;
        }

        if (pointsUpdated) this.steps++;
        else this.stop();
        return pointsUpdated;
    }

    /**
     * draw method
     */
    draw() {
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (!SandStack.ADAPTIVE_COLOR) this.ctx.fillStyle = '#000';
        for (const point of this.stack) {
            if (SandStack.ADAPTIVE_COLOR) {
                const color = point.size <= SandStack.MAX_SAND_PER_STACK ?
                    this.colors[(point.size - 1)|0] :
                    (point.size <= SandStack.MAX_SAND_PER_STACK * 2) ?
                        this.colors[this.colors.length - 2] :
                        this.colors[this.colors.length - 1];
                this.ctx.fillStyle = color;
            }
            this.ctx.fillRect(
                point.x * SandStack.POINT_SIZE - (SandStack.POINT_SIZE / 2),
                point.y * SandStack.POINT_SIZE - (SandStack.POINT_SIZE / 2),
                SandStack.POINT_SIZE,
                SandStack.POINT_SIZE
            );
        }
    }

    /**
     * loop method
     */
    loop() {
        if (this.running) {
            if (SandStack.STEP_DELAY === 0) {
                while (this.step() !== 0) {
                    if (SandStack.DRAW_ON_ZERO_DELAY) {
                        window.requestAnimationFrame(this.draw.bind(this));
                    }
                }
                this.draw();
            } else {
                this.step();
                window.requestAnimationFrame(this.draw.bind(this));
                setTimeout(this.loop.bind(this), SandStack.STEP_DELAY);
            }
        }
    }

    /**
     * start simulation
     */
    start() {
        this.running = true;
        this.startedAt = Date.now();
        this.loop();
    }
    /**
     * stop simulation
     */
    stop() {
        this.running = false;
        console.log('simulation stopped after', this.steps, 'steps in', Date.now() - this.startedAt, 'ms');
    }
}
