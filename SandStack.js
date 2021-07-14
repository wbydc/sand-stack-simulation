function SandStackFactory(options) {
    options = Object.assign({}, options, {
        /**
         * initial stack size 
         */
        INIT_SIZE: 100,
        /**
         * point size in pixels
         */
        POINT_SIZE: 4,
        /**
         * delay between steps in ms (0 is unstopable)
         */
        STEP_DELAY: 100,
        /**
         * should it draw then STEP_DELAY set to 0
         */
        DRAW_ON_ZERO_DELAY: false,
        /**
         * defines maximum stable stack size
         */
        MAX_SAND_PER_STACK: 4,
        /**
         * turns on adaptive color
         */
        ADAPTIVE_COLOR: true,
        /**
         * adaptive color offset from white
         */
        ADAPTIVE_COLOR_OFFSET: 0x66,
    });

    class SandStack {
        constructor(options) {
            this.INIT_SIZE = options.INIT_SIZE;
            this.POINT_SIZE = options.POINT_SIZE;
            this.STEP_DELAY = options.STEP_DELAY;
            this.DRAW_ON_ZERO_DELAY = options.DRAW_ON_ZERO_DELAY;
            this.MAX_SAND_PER_STACK = options.MAX_SAND_PER_STACK;
            this.ADAPTIVE_COLOR = options.ADAPTIVE_COLOR;
            this.ADAPTIVE_COLOR_OFFSET = options.ADAPTIVE_COLOR_OFFSET;

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
                x: this.canvas.width / this.POINT_SIZE,
                y: this.canvas.height / this.POINT_SIZE,
            };

            if (this.ADAPTIVE_COLOR) {
                /**
                 * set of used colours
                 */
                this.colors = [];
                const maxColours = this.MAX_SAND_PER_STACK + 2;
                const colorStep = ((0xFF - this.ADAPTIVE_COLOR_OFFSET) / maxColours) |0;
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

            const centerPoint = this.point((this.size.x / 2)|0, (this.size.y / 2)|0, this.INIT_SIZE);
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
                if (point.size >= this.MAX_SAND_PER_STACK) {
                    pointsUpdated++;
                    point.size -= this.MAX_SAND_PER_STACK;
                    for (let i = 0; i < 4; i++) {
                        const newPoint = this.point(point.x + (i % 2 ? (i - 2) : 0), point.y + (i % 2 ? 0 : (i - 1)), 1);
                        if (newPoint.x < 0 || newPoint.x > this.size.x || newPoint.y < 0 || newPoint.y > this.size.y) continue;
                        if (this.matrix[newPoint.x][newPoint.y]) {
                            this.matrix[newPoint.x][newPoint.y].size += this.MAX_SAND_PER_STACK / 4;
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
            if (!this.ADAPTIVE_COLOR) this.ctx.fillStyle = '#000';
            for (const point of this.stack) {
                if (this.ADAPTIVE_COLOR) {
                    const color = point.size <= this.MAX_SAND_PER_STACK ?
                        this.colors[(point.size - 1)|0] :
                        (point.size <= this.MAX_SAND_PER_STACK * 2) ?
                            this.colors[this.colors.length - 2] :
                            this.colors[this.colors.length - 1];
                    this.ctx.fillStyle = color;
                }
                this.ctx.fillRect(
                    point.x * this.POINT_SIZE - (this.POINT_SIZE / 2),
                    point.y * this.POINT_SIZE - (this.POINT_SIZE / 2),
                    this.POINT_SIZE,
                    this.POINT_SIZE
                );
            }
        }

        /**
         * loop method
         */
        loop() {
            if (this.running) {
                if (this.STEP_DELAY === 0) {
                    while (this.step() !== 0) {
                        if (this.DRAW_ON_ZERO_DELAY) {
                            window.requestAnimationFrame(this.draw.bind(this));
                        }
                    }
                    this.draw();
                } else {
                    this.step();
                    window.requestAnimationFrame(this.draw.bind(this));
                    setTimeout(this.loop.bind(this), this.STEP_DELAY);
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

    return new SandStack(options);
}
