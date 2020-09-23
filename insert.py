def func (li, x, lo=0, hi=None):

    if not hi: hi = len(li)

    while (lo < hi):
        print(lo,hi)
        mid = (lo+hi)//2

        if  x < li[mid]:
            hi = mid

        else:
            print(lo)
            lo = mid+1
   
    li.insert(lo,x)  
    return li

print(func([1,2,4],5))