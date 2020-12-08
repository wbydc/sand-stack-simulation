# Sand stack simulation

May be not very accurate, but memory and time efficient

![1000000 items](/sandstack.png)
1000000 items

## Usage

```javascript
const sandStack = new SandStack();
sandStack.start();

// automatically stops when there is no turns, but you can stop any time using
sandStack.stop();

// also you can manually call next step simulation and draw
sandStack.step();
sandStack.draw();

// if you want to start again, reset simulation using
sandStack.init();
```

## Config

To configure change static fields of SandStack class

- INIT_SIZE - initial stack size 
- POINT_SIZE - point size in pixels
- STEP_DELAY - delay between steps in ms (0 is unstopable)
- DRAW_ON_ZERO_DELAY - should it draw then STEP_DELAY set to 0
- MAX_SAND_PER_STACK - defines maximum stable stack size
- ADAPTIVE_COLOR - turns on adaptive color 
- ADAPTIVE_COLOR_OFFSET - adaptive color offset from white
