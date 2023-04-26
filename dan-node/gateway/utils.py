import os


def check_and_create_directory(*args):
    path = os.path.join(*args)

    if not os.path.exists(path):
        os.makedirs(path)

    return path


if __name__ == "__main__":
    print(check_and_create_directory("a", "b", "c"))
