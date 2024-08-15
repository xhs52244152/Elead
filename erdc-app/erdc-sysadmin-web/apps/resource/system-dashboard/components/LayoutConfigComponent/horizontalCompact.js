define([], function() {
    function getStatics(layout) {
        //return [];
        return layout.filter((l) => l.static);
    }

    function sortLayoutItemsByRowCol(layout) {
        return [].concat(layout).sort(function(a, b) {
            if (a.y === b.y && a.x === b.x) {
                return 0;
            }
            if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
                return 1;
            }
            return -1;
        });
    }

    function compactItem(compareWith, l, verticalCompact) {
        if (verticalCompact) {
            // Move the element up as far as it can go without colliding.
            while (l.y > 0 && !getFirstCollision(compareWith, l)) {
                l.y--;
            }
        }

        // Move it down, and keep moving it down if it's colliding.
        let collides;
        while((collides = getFirstCollision(compareWith, l))) {
            l.y = collides.y + collides.h;
        }
        return l;
    }

    function getFirstCollision(layout, layoutItem) {
        for (let i = 0, len = layout.length; i < len; i++) {
            if (collides(layout[i], layoutItem)){
                return layout[i];
            }
        }
    }

    function collides(l1, l2) {
        if (l1 === l2) {
            return false; // same element
        }
        if (l1.x + l1.w <= l2.x) {
            return false; // l1 is left of l2
        }
        if (l1.x >= l2.x + l2.w) {
            return false; // l1 is right of l2
        }
        if (l1.y + l1.h <= l2.y) {
            return false; // l1 is above l2
        }
        if (l1.y >= l2.y + l2.h) {
            return false; // l1 is below l2
        }
        return true; // boxes overlap
    }

    function compact(layout, verticalCompact) {
        // Statics go in the compareWith array right away so items flow around them.
        const compareWith = getStatics(layout);
        // We go through the items by row and column.
        const sorted = sortLayoutItemsByRowCol(layout);
        // Holding for new items.
        const out = Array(layout.length);

        for (let i = 0, len = sorted.length; i < len; i++) {
            let l = sorted[i];

            // Don't move static elements
            if (!l.static) {
                l = compactItem(compareWith, l, verticalCompact);

                // Add to comparison array. We only collide with items before this one.
                // Statics are already in this array.
                compareWith.push(l);
            }

            // Add to output array to make sure they still come out in the right order.
            out[layout.indexOf(l)] = l;

            // Clear moved flag, if it exists.
            l.moved = false;
        }
        return out;
    }
    return compact;
})
