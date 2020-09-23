# given a list find the pairs that add up to the sum
'''
q1: valid sum
q2: repeated values




'''
def find_sum(sumn,li):
    sum_dict = {}
    result = []
    for i in li:
        if sumn-i in sum_dict: 
            result.append([i, sumn-i])
            continue
        sum_dict[i] = sumn-i

    return result

print (find_sum(10,[3,4,6,7,7]))
        