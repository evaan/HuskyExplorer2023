const deadzone = 0.1;

function degrees(radians) {return radians * (180/Math.PI);}

function motor_values(x, y, r, v) {
    y *= -1;
    if (r != 0) {
        return [100*r, -100*r, -100*r, 100*r];
    }

    const p = Math.sqrt(x * x + y * y);
    let AC, BD;
    if ((x < 0) != (y < 0)) {
        if (y !== 0) AC = ((100 - (degrees(Math.atan(Math.abs(x / y))) * (20/9)))) * p;
        else AC = -100 * p;
        BD = 100 * p;
        
    } else {
        AC = 100 * p;
        if (y !== 0) BD = (100 - (degrees(Math.atan(Math.abs(x/y))) * (20/9))) * p;
        else BD = -100 * p;
    }

    if (y<0) return [-AC, -BD, -AC, -BD];
    else return [AC, BD, AC, BD];
}