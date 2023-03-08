package com.symphony.devsol.client;

import com.symphony.bdk.core.service.user.UserService;
import com.symphony.bdk.gen.api.model.UserV2;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequiredArgsConstructor
public class SymphonyClient {
    private final UserService users;
    record SimpleUser(Long id, String displayName, String emailAddress) {}

    @Cacheable("user")
    @GetMapping("user/{userId}")
    public SimpleUser getSymphonyUser(@PathVariable long userId) {
        List<UserV2> userList = users.listUsersByIds(List.of(userId));
        if (userList.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "No such user");
        }
        UserV2 user = userList.get(0);
        return new SimpleUser(user.getId(), user.getDisplayName(), user.getEmailAddress());
    }
}
