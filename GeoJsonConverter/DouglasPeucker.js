function dist(a, b, p) {
    let ab = [b[0] - a[0], b[1] - a[1]];
    let bp = [p[0] - b[0], p[1] - b[1]];
    let ap = [p[0] - a[0], p[1] - a[1]];

    let ab_dot_bp = ab[0] * bp[0] + ab[1] * bp[1];
    let ab_dot_ap = ab[0] * ap[0] + ab[1] * ap[1];

    let distance = 0

    //if bp is in the same direction as ab, p is closest to b
    if (ab_dot_bp > 0) {
        distance = Math.sqrt((p[0] - b[0]) * (p[0] - b[0]) + (p[1] - b[1]) * (p[1] - b[1]));
    }
    //if ap is in the opposite direction from ab, p is closest to a
    else if (ab_dot_ap < 0) {
        distance = Math.sqrt((p[0] - a[0]) * (p[0] - a[0]) + (p[1] - a[1]) * (p[1] - a[1]));
    }
    else {
        let denominator = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1]);
        distance = Math.abs(ab[0] * ap[1] - ab[1] * ap[0]) / denominator;
    }
    return distance;
}

//epsilon = minimum distance that a point needs to be from a line segment formed by two other points around it
//The point is omitted if the distance < epsilon
function rdp(points, epsilon) {
    let max_distance = 0;
    let index = 0;
    let end = points.length - 1;
    //find the point farthest from the given line segment
    for (let i = 1; i < end; i++) {
        let current_distance = dist(points[0], points[end], points[i]);
        if (current_distance > max_distance) {
            max_distance = current_distance;
            index = i;
        }
    }
    let result_list = [];
    //if the point is critical, then recursively simplify
    if (max_distance > epsilon) {
        let results1 = rdp(points.slice(0, index + 1), epsilon);
        let results2 = rdp(points.slice(index), epsilon);
        result_list = results1.slice(0, results1.length - 1).concat(results2);
    }
    //else, ignore all points on the line segment
    else {
        result_list = [points[0], points[end]];
    }
    
    return result_list;
}

// const points = [
//     [0, 0],
//     [1, 0.1],
//     [2, -0.1],
//     [3, 5],
//     [4, 6],
//     [5, 7],
//     [6, 8.1],
//     [7, 9],
//     [8, 9],
//     [9, 9]];
   
//   console.log(rdp(points, 1));